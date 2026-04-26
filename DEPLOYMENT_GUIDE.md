# ChainGuard Deployment Guide (Render & Vercel)

This guide provides the exact steps and configuration settings to take ChainGuard from local development to live production.

## 1. Backend & ML Engine (Render)

Render is used for the Node.js API and the Python ML Engine. We use a "Blueprint" (`render.yaml`) to automate the setup.

### Steps:
1.  **Push Code**: Ensure your latest code is pushed to GitHub.
2.  **Connect to Render**: Log in to [render.com](https://render.com) and click **"New +"** → **"Blueprint"**.
3.  **Connect Repository**: Select your `ChainGuard` repository.
4.  **Review Blueprint**: Render will detect `render.yaml`. Click **"Apply"**.
5.  **Set Environment Variables**: In the Render Dashboard, go to each service and manually add the secret keys that were marked as `sync: false`.

### Environment Variables for `chainguard-api`:
| Key | Value Source |
| :--- | :--- |
| `SUPABASE_URL` | Supabase Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase Settings → API → `anon` public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Settings → API → `service_role` secret key |

### Environment Variables for `chainguard-ml`:
| Key | Value Source |
| :--- | :--- |
| `OPENWEATHER_API_KEY` | Your OpenWeatherMap API Key |
| `NEWS_API_KEY` | Your NewsAPI Key |

---

## 2. Frontend (Vercel)

Vercel is used for the React frontend.

### Steps:
1.  **Login to Vercel**: Go to [vercel.com](https://vercel.com) and click **"Add New"** → **"Project"**.
2.  **Import Repository**: Select your `ChainGuard` repository.
3.  **Configure Project Settings**:
    *   **Framework Preset**: Vite
    *   **Root Directory**: `chainguard-frontend` (Click "Edit" next to the root folder icon)
4.  **Add Environment Variables**:
    *   Expand the "Environment Variables" section.
    *   Add the following variables:

| Key | Value |
| :--- | :--- |
| `VITE_API_BASE_URL` | The URL of your `chainguard-api` on Render (e.g., `https://chainguard-api.onrender.com`) |
| `VITE_ML_BASE_URL` | The URL of your `chainguard-ml` on Render (e.g., `https://chainguard-ml.onrender.com`) |
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase `anon` public key |
| `VITE_EMAILJS_SERVICE_ID` | Your EmailJS Service ID |
| `VITE_EMAILJS_TEMPLATE_ID` | Your EmailJS Template ID |
| `VITE_EMAILJS_PUBLIC_KEY` | Your EmailJS Public Key |

5.  **Deploy**: Click **"Deploy"**. Vercel will build the project and provide a live URL.

---

## 3. Post-Deployment Troubleshooting

### CORS Issues
If the frontend cannot talk to the backend, ensure the `cors` configuration in `chainguard-backend/server.js` allows your Vercel URL.
*   **Location**: `chainguard-backend/server.js`
*   **Change**: Update the origin to your Vercel URL or `*` for testing.

### API URL Mismatch
Ensure that `VITE_API_BASE_URL` and `VITE_ML_BASE_URL` in Vercel **do not** have a trailing slash (e.g., use `https://api.com`, not `https://api.com/`).

### Supabase RLS
If you see "Permission Denied" in the console, double-check that you ran the `schema.sql` and that Row Level Security (RLS) is enabled but correctly configured for the roles.
