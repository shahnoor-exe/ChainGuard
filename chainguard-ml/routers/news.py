# ============================================================
# ChainGuard — News Router
# Supply chain news analysis endpoints.
# ============================================================
from fastapi import APIRouter

from services.news_service import NewsService

router = APIRouter(prefix="/news", tags=["News"])
news_service = NewsService()


@router.get("/risk-summary")
async def get_risk_summary():
    """Aggregated risk analysis across latest supply chain news."""
    try:
        result = await news_service.get_risk_summary()
        return {"success": True, "data": result, "message": "News risk summary"}
    except Exception as e:
        return {"success": False, "data": None, "message": str(e)}


@router.get("/latest")
async def get_latest_news():
    """Fetch and analyze latest supply chain news articles."""
    try:
        articles = await news_service.fetch_supply_chain_news()
        analyzed = [news_service.analyze_article(a) for a in articles]
        return {
            "success": True,
            "data": analyzed,
            "count": len(analyzed),
            "message": f"Analyzed {len(analyzed)} articles",
        }
    except Exception as e:
        return {"success": False, "data": None, "message": str(e)}
