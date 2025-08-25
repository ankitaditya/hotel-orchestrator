/**
 * Temporal Workflows - Business process orchestration
 * 
 * @author Ankit Aditya <ankit.see@gmail.com>
 * @description Temporal.io workflows for hotel comparison and health check processes
 */

import { proxyActivities } from '@temporalio/workflow';
import { DeduplicatedHotel, SupplierResponse } from '../types/hotel';
import type * as activities from './activities';

const { fetchSupplierAHotels, fetchSupplierBHotels, checkSupplierHealth } = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 seconds',
  retry: {
    initialInterval: '1 second',
    maximumInterval: '10 seconds',
    maximumAttempts: 3,
  },
});

export async function hotelComparisonWorkflow(city: string): Promise<DeduplicatedHotel[]> {
  // Fetch hotels from both suppliers in parallel
  const [supplierAResult, supplierBResult] = await Promise.all([
    fetchSupplierAHotels(city),
    fetchSupplierBHotels(city)
  ]);

  // Combine all hotels from both suppliers
  const allHotels: Array<{ hotel: any; supplier: string }> = [];
  
  if (supplierAResult.success) {
    supplierAResult.hotels.forEach(hotel => {
      allHotels.push({ hotel, supplier: 'Supplier A' });
    });
  }
  
  if (supplierBResult.success) {
    supplierBResult.hotels.forEach(hotel => {
      allHotels.push({ hotel, supplier: 'Supplier B' });
    });
  }

  // Deduplicate hotels by name and select the best price
  const hotelMap = new Map<string, DeduplicatedHotel>();
  
  allHotels.forEach(({ hotel, supplier }) => {
    const hotelName = hotel.name.toLowerCase();
    
    if (!hotelMap.has(hotelName)) {
      // First occurrence of this hotel
      hotelMap.set(hotelName, {
        name: hotel.name,
        price: hotel.price,
        supplier: supplier,
        commissionPct: hotel.commissionPct
      });
    } else {
      // Hotel already exists, compare prices
      const existingHotel = hotelMap.get(hotelName)!;
      if (hotel.price < existingHotel.price) {
        // New hotel has better price, replace it
        hotelMap.set(hotelName, {
          name: hotel.name,
          price: hotel.price,
          supplier: supplier,
          commissionPct: hotel.commissionPct
        });
      }
    }
  });

  // Convert map to array and sort by price
  return Array.from(hotelMap.values()).sort((a, b) => a.price - b.price);
}

export async function healthCheckWorkflow(): Promise<{
  supplierA: boolean;
  supplierB: boolean;
}> {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  
  const [supplierAHealth, supplierBHealth] = await Promise.all([
    checkSupplierHealth(`${baseUrl}/supplierA/hotels?city=delhi`),
    checkSupplierHealth(`${baseUrl}/supplierB/hotels?city=delhi`)
  ]);

  return {
    supplierA: supplierAHealth,
    supplierB: supplierBHealth
  };
}