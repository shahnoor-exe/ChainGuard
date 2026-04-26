# ============================================================
# ChainGuard — News Service (NewsAPI + keyword NLP)
# Fetches supply chain news and scores disruption risk.
# ============================================================
import os
import httpx
from datetime import datetime, timezone

NEWS_API_KEY = os.getenv("NEWS_API_KEY", "")
NEWS_API_URL = "https://newsapi.org/v2/everything"

# 25 Indian cities for mention detection
INDIA_CITIES = [
    "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad",
    "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
    "Nagpur", "Bhopal", "Indore", "Surat", "Vadodara",
    "Coimbatore", "Kochi", "Vizag", "Patna", "Chandigarh",
    "Ludhiana", "Amritsar", "Guwahati", "Bhubaneswar", "Raipur",
]

DISRUPTION_KEYWORDS = {
    "blockade": 8,
    "bandh": 9,
    "protest": 6,
    "strike": 7,
    "road block": 8,
    "accident": 5,
    "flood": 8,
    "landslide": 9,
    "highway closed": 9,
    "port congestion": 7,
    "fuel shortage": 6,
    "truck driver strike": 9,
    "supply chain disruption": 7,
    "logistics delay": 6,
    "road closure": 8,
}

MOCK_ARTICLES = [
    {
        "title": "Heavy monsoon rainfall disrupts Mumbai-Pune highway traffic",
        "description": "Severe waterlogging on NH-48 has brought traffic to a standstill. Supply chain logistics between Mumbai and Pune are severely affected.",
        "source": {"name": "Times of India"},
        "publishedAt": datetime.now(timezone.utc).isoformat(),
        "url": "https://example.com/mumbai-pune-rain",
    },
    {
        "title": "Truck drivers' strike enters second day across Gujarat",
        "description": "Transport unions in Ahmedabad and Surat have called for an indefinite truck driver strike over fuel prices.",
        "source": {"name": "Economic Times"},
        "publishedAt": datetime.now(timezone.utc).isoformat(),
        "url": "https://example.com/truck-strike-gujarat",
    },
    {
        "title": "Landslide blocks NH-44 near Hyderabad-Bangalore corridor",
        "description": "A major landslide near Kurnool has blocked both lanes of NH-44. Heavy vehicles diverted via alternate routes.",
        "source": {"name": "NDTV"},
        "publishedAt": datetime.now(timezone.utc).isoformat(),
        "url": "https://example.com/nh44-landslide",
    },
    {
        "title": "Port congestion at Chennai delays container shipments",
        "description": "Chennai port faces severe congestion with over 200 containers awaiting clearance. Electronics supply chain impacted.",
        "source": {"name": "Business Standard"},
        "publishedAt": datetime.now(timezone.utc).isoformat(),
        "url": "https://example.com/chennai-port",
    },
    {
        "title": "Farmer protest blockade continues on Delhi-Chandigarh highway",
        "description": "Farm unions blocking NH-44 at Ludhiana. Commercial logistics traffic halted for over 48 hours.",
        "source": {"name": "The Hindu"},
        "publishedAt": datetime.now(timezone.utc).isoformat(),
        "url": "https://example.com/farmer-protest",
    },
]


class NewsService:

    async def fetch_supply_chain_news(self) -> list:
        """Fetch latest supply chain / logistics news from India."""
        if not NEWS_API_KEY or NEWS_API_KEY.startswith("your_"):
            return MOCK_ARTICLES

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                print(f"[DEBUG] Fetching news with key: {NEWS_API_KEY[:4]}...{NEWS_API_KEY[-4:]}")
                resp = await client.get(
                    NEWS_API_URL,
                    params={
                        "q": "supply chain OR logistics OR highway OR bandh OR transport India",
                        "language": "en",
                        "sortBy": "publishedAt",
                        "pageSize": 20,
                        "apiKey": NEWS_API_KEY,
                    },
                )
                print(f"[DEBUG] NewsAPI status: {resp.status_code}")
                if resp.status_code != 200:
                    print(f"[WARN] NewsAPI returned {resp.status_code}: {resp.text}")
                    return MOCK_ARTICLES

                data = resp.json()
                articles = data.get("articles", [])
                print(f"[DEBUG] NewsAPI returned {len(articles)} articles")
                return articles if articles else MOCK_ARTICLES
        except Exception as e:
            print(f"[WARN] News fetch failed: {e}")
            return MOCK_ARTICLES

    def analyze_article(self, article: dict) -> dict:
        """Score a single article for supply chain disruption risk."""
        title = article.get("title", "") or ""
        desc = article.get("description", "") or ""
        text = f"{title} {desc}".lower()

        # Keyword scoring
        total_weight = 0
        matched = []
        for keyword, weight in DISRUPTION_KEYWORDS.items():
            if keyword in text:
                total_weight += weight
                matched.append(keyword)

        risk_score = min(int(total_weight * 5), 100)  # scale up, cap at 100

        # City mention detection
        affected_cities = [c for c in INDIA_CITIES if c.lower() in text]

        # Severity label
        if risk_score <= 30:
            severity = "Low"
        elif risk_score <= 60:
            severity = "Medium"
        elif risk_score <= 80:
            severity = "High"
        else:
            severity = "Critical"

        return {
            "title": article.get("title", ""),
            "source": article.get("source", {}).get("name", "Unknown"),
            "published_at": article.get("publishedAt", ""),
            "url": article.get("url", ""),
            "risk_score": risk_score,
            "affected_cities": affected_cities,
            "keywords_matched": matched,
            "severity": severity,
        }

    async def get_risk_summary(self) -> dict:
        """Aggregate risk analysis across all fetched articles."""
        articles = await self.fetch_supply_chain_news()
        analyzed = [self.analyze_article(a) for a in articles]

        # Aggregate
        scores = [a["risk_score"] for a in analyzed]
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0

        high_risk = [a for a in analyzed if a["risk_score"] > 50]

        # Most mentioned cities
        city_counts: dict = {}
        for a in analyzed:
            for c in a["affected_cities"]:
                city_counts[c] = city_counts.get(c, 0) + 1
        top_cities = sorted(city_counts, key=city_counts.get, reverse=True)[:5]

        return {
            "total_articles_analyzed": len(analyzed),
            "high_risk_articles": high_risk,
            "overall_news_risk_score": avg_score,
            "most_affected_cities": top_cities,
            "all_analyzed": analyzed,
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }
