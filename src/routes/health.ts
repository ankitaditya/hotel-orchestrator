/**
 * Health Check Routes - System health monitoring endpoints
 * 
 * @author Ankit Aditya <ankit.see@gmail.com>
 * @description Health check endpoints for monitoring supplier availability
 */

import { Router, Request, Response } from 'express';
import { checkSupplierHealth } from '../services/hotelService';
import { HealthStatus } from '../types/hotel';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
  try {
    console.log('Executing health check workflow');
    
    const healthResults = await checkSupplierHealth();
    
    const healthStatus: HealthStatus = {
      status: (healthResults.supplierA && healthResults.supplierB) ? 'healthy' : 'unhealthy',
      suppliers: {
        supplierA: healthResults.supplierA ? 'healthy' : 'unhealthy',
        supplierB: healthResults.supplierB ? 'healthy' : 'unhealthy'
      },
      timestamp: new Date().toISOString()
    };

    // Return appropriate HTTP status code
    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json(healthStatus);

  } catch (error: any) {
    console.error('Error in health check endpoint:', error);
    
    const errorHealthStatus: HealthStatus = {
      status: 'unhealthy',
      suppliers: {
        supplierA: 'unhealthy',
        supplierB: 'unhealthy'
      },
      timestamp: new Date().toISOString()
    };

    res.status(503).json(errorHealthStatus);
  }
});

export default router;