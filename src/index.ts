/**
 * Hotel Offer Orchestrator - Main Application Entry Point
 * 
 * @author Ankit Aditya <ankit.see@gmail.com>
 * @description Hotel offer aggregation and orchestration service using Temporal.io
 * @version 1.0.0
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import suppliersRouter from './routes/suppliers';
import hotelsRouter from './routes/hotels';
import healthRouter from './routes/health';
import { closeMockRedisConnection } from './services/mockRedisClient';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for iframe compatibility
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true
}));

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint (must be defined before other routes)
app.get('/', (req, res) => {
  res.json({
    message: 'Hotel Offer Orchestrator API',
    version: '1.0.0',
    endpoints: {
      hotels: '/api/hotels?city=<city>&minPrice=<min>&maxPrice=<max>',
      health: '/health',
      supplierA: '/supplierA/hotels?city=<city>',
      supplierB: '/supplierB/hotels?city=<city>'
    }
  });
});

// Routes
app.use('/', suppliersRouter); // Mock supplier endpoints
app.use('/api', hotelsRouter); // Main API endpoints
app.use('/', healthRouter); // Health check endpoint

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await closeMockRedisConnection();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await closeMockRedisConnection();
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Hotel Offer Orchestrator API running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  - GET /api/hotels?city=<city>&minPrice=<min>&maxPrice=<max>`);
  console.log(`  - GET /health`);
  console.log(`  - GET /supplierA/hotels?city=<city>`);
  console.log(`  - GET /supplierB/hotels?city=<city>`);
});

export default app;