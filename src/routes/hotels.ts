/**
 * Hotel Routes - Main API endpoints for hotel search and aggregation
 * 
 * @author Ankit Aditya <ankit.see@gmail.com>
 * @description Handles hotel search requests with deduplication and price filtering
 */

import { Router, Request, Response } from 'express';
import { compareHotels } from '../services/hotelService';
import { cacheHotels, getCachedHotels, filterHotelsByPrice } from '../services/mockRedisClient';
import { HotelSearchParams } from '../types/hotel';

const router = Router();

router.get('/hotels', async (req: Request, res: Response) => {
  try {
    const { city, minPrice, maxPrice } = req.query as Partial<HotelSearchParams>;

    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    // Validate price parameters
    const minPriceNum = minPrice ? parseFloat(minPrice.toString()) : undefined;
    const maxPriceNum = maxPrice ? parseFloat(maxPrice.toString()) : undefined;

    if (minPriceNum !== undefined && isNaN(minPriceNum)) {
      return res.status(400).json({ error: 'Invalid minPrice parameter' });
    }

    if (maxPriceNum !== undefined && isNaN(maxPriceNum)) {
      return res.status(400).json({ error: 'Invalid maxPrice parameter' });
    }

    if (minPriceNum !== undefined && maxPriceNum !== undefined && minPriceNum > maxPriceNum) {
      return res.status(400).json({ error: 'minPrice cannot be greater than maxPrice' });
    }

    console.log(`Searching hotels for city: ${city}, minPrice: ${minPriceNum}, maxPrice: ${maxPriceNum}`);

    // Try to get cached results first
    let hotels = await getCachedHotels(city.toString());

    if (!hotels) {
      console.log('No cached results found, executing hotel comparison');
      // Execute hotel comparison to get fresh data
      hotels = await compareHotels(city.toString());
      
      // Cache the results
      await cacheHotels(city.toString(), hotels);
    } else {
      console.log('Using cached results');
    }

    // Apply price filtering
    const filteredHotels = filterHotelsByPrice(hotels, minPriceNum, maxPriceNum);

    res.json(filteredHotels);

  } catch (error: any) {
    console.error('Error in hotels endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

export default router;