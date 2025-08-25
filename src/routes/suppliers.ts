/**
 * Supplier Routes - Mock supplier API endpoints
 * 
 * @author Ankit Aditya <ankit.see@gmail.com>
 * @description Mock APIs for Supplier A and Supplier B with hotel data
 */

import { Router, Request, Response } from 'express';
import { supplierAData, supplierBData, supplierAHealthy, supplierBHealthy } from '../services/mockData';
import { Hotel } from '../types/hotel';

const router = Router();

// Supplier A endpoint
router.get('/supplierA/hotels', (req: Request, res: Response) => {
  try {
    // Simulate supplier being down
    if (!supplierAHealthy) {
      return res.status(503).json({ error: 'Supplier A is currently unavailable' });
    }

    const { city } = req.query;
    
    let hotels: Hotel[] = supplierAData;
    
    if (city) {
      hotels = supplierAData.filter(hotel => 
        hotel.city.toLowerCase() === (city as string).toLowerCase()
      );
    }

    // Simulate some network delay
    setTimeout(() => {
      res.json(hotels);
    }, Math.random() * 500 + 100); // 100-600ms delay

  } catch (error) {
    res.status(500).json({ error: 'Internal server error in Supplier A' });
  }
});

// Supplier B endpoint
router.get('/supplierB/hotels', (req: Request, res: Response) => {
  try {
    // Simulate supplier being down
    if (!supplierBHealthy) {
      return res.status(503).json({ error: 'Supplier B is currently unavailable' });
    }

    const { city } = req.query;
    
    let hotels: Hotel[] = supplierBData;
    
    if (city) {
      hotels = supplierBData.filter(hotel => 
        hotel.city.toLowerCase() === (city as string).toLowerCase()
      );
    }

    // Simulate some network delay
    setTimeout(() => {
      res.json(hotels);
    }, Math.random() * 500 + 100); // 100-600ms delay

  } catch (error) {
    res.status(500).json({ error: 'Internal server error in Supplier B' });
  }
});

export default router;