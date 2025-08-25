/**
 * Hotel Service - Core business logic for hotel aggregation and comparison
 * 
 * @author Ankit Aditya <ankit.see@gmail.com>
 * @description Handles hotel comparison, deduplication, and supplier health checks
 */

import axios from 'axios';
import { Hotel, DeduplicatedHotel, SupplierResponse } from '../types/hotel';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

export async function fetchSupplierAHotels(city: string): Promise<SupplierResponse> {
  try {
    const response = await axios.get(`${BASE_URL}/supplierA/hotels`, {
      params: { city },
      timeout: 5000
    });
    
    return {
      supplier: 'Supplier A',
      hotels: response.data as Hotel[],
      success: true
    };
  } catch (error: any) {
    console.error('Error fetching from Supplier A:', error.message);
    return {
      supplier: 'Supplier A',
      hotels: [],
      success: false,
      error: error.message
    };
  }
}

export async function fetchSupplierBHotels(city: string): Promise<SupplierResponse> {
  try {
    const response = await axios.get(`${BASE_URL}/supplierB/hotels`, {
      params: { city },
      timeout: 5000
    });
    
    return {
      supplier: 'Supplier B',
      hotels: response.data as Hotel[],
      success: true
    };
  } catch (error: any) {
    console.error('Error fetching from Supplier B:', error.message);
    return {
      supplier: 'Supplier B',
      hotels: [],
      success: false,
      error: error.message
    };
  }
}

export async function compareHotels(city: string): Promise<DeduplicatedHotel[]> {
  console.log(`Starting hotel comparison for city: ${city}`);
  
  // Fetch hotels from both suppliers in parallel
  const [supplierAResult, supplierBResult] = await Promise.all([
    fetchSupplierAHotels(city),
    fetchSupplierBHotels(city)
  ]);

  console.log(`Supplier A: ${supplierAResult.success ? supplierAResult.hotels.length : 0} hotels`);
  console.log(`Supplier B: ${supplierBResult.success ? supplierBResult.hotels.length : 0} hotels`);

  // Combine all hotels from both suppliers
  const allHotels: Array<{ hotel: Hotel; supplier: string }> = [];
  
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
      console.log(`Added ${hotel.name} from ${supplier} at ₹${hotel.price}`);
    } else {
      // Hotel already exists, compare prices
      const existingHotel = hotelMap.get(hotelName)!;
      if (hotel.price < existingHotel.price) {
        // New hotel has better price, replace it
        console.log(`Better price found for ${hotel.name}: ${supplier} (₹${hotel.price}) vs ${existingHotel.supplier} (₹${existingHotel.price})`);
        hotelMap.set(hotelName, {
          name: hotel.name,
          price: hotel.price,
          supplier: supplier,
          commissionPct: hotel.commissionPct
        });
      } else {
        console.log(`Keeping existing price for ${hotel.name}: ${existingHotel.supplier} (₹${existingHotel.price}) vs ${supplier} (₹${hotel.price})`);
      }
    }
  });

  // Convert map to array and sort by price
  const result = Array.from(hotelMap.values()).sort((a, b) => a.price - b.price);
  console.log(`Final result: ${result.length} deduplicated hotels`);
  
  return result;
}

export async function checkSupplierHealth(): Promise<{ supplierA: boolean; supplierB: boolean }> {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  
  try {
    const [supplierAHealth, supplierBHealth] = await Promise.all([
      checkSupplierHealthEndpoint(`${baseUrl}/supplierA/hotels?city=delhi`),
      checkSupplierHealthEndpoint(`${baseUrl}/supplierB/hotels?city=delhi`)
    ]);

    return {
      supplierA: supplierAHealth,
      supplierB: supplierBHealth
    };
  } catch (error) {
    console.error('Error checking supplier health:', error);
    return {
      supplierA: false,
      supplierB: false
    };
  }
}

async function checkSupplierHealthEndpoint(url: string): Promise<boolean> {
  try {
    const response = await axios.get(url, { timeout: 3000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}