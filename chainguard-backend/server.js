// ============================================================
// ChainGuard — Main Express Server
// ============================================================
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

// Route modules
import shipmentsRouter from './routes/shipments.js';
import suppliersRouter from './routes/suppliers.js';
import disruptionsRouter from './routes/disruptions.js';
import routesApiRouter from './routes/routes_api.js';
import dashboardRouter from './routes/dashboard.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://chain-guard-olive.vercel.app',     // ← your ACTUAL Vercel URL
  'https://chainguard.vercel.app',             // keep old one too
  /\.vercel\.app$/,                            // allow ALL vercel preview URLs
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`CORS blocked: ${origin}`);
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
}));

// Handle OPTIONS preflight for all routes
app.options('*', cors());
app.use(express.json());            // Parse JSON bodies

// ── Health Check ────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    status: 'ChainGuard API running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── Mount Routes ────────────────────────────────────────────
app.use('/api/shipments', shipmentsRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/disruptions', disruptionsRouter);
app.use('/api/routes', routesApiRouter);
app.use('/api/dashboard', dashboardRouter);

// ── 404 Fallback ────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

// ── Global Error Handler ────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('🔥 Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`⚡ ChainGuard API live on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/`);
});
