/**
 * Mock Redis Client - In-memory caching service for testing
 * 
 * @author Ankit Aditya <ankit.see@gmail.com>
 * @description Mock Redis implementation for caching hotel data without external dependencies
 */

import { DeduplicatedHotel } from '../types/hotel';

// Mock Redis client for testing without external dependencies
class MockRedisClient {
  private cache: Map<string, { data: string; expiry: number }> = new Map();

  async setEx(key: string, seconds: number, value: string): Promise<void> {
    const expiry = Date.now() + (seconds * 1000);
    this.cache.set(key, { data: value, expiry });
    console.log(`Mock Redis: Cached ${key} for ${seconds} seconds`);
  }

  async get(key: string): Promise<string | null> {
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }
    
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    console.log(`Mock Redis: Retrieved cached ${key}`);
    return cached.data;
  }

  async quit(): Promise<void> {
    this.cache.clear();
    console.log('Mock Redis: Connection closed');
  }
}

let mockRedisClient: MockRedisClient | null = null;

export async function getMockRedisClient(): Promise<MockRedisClient> {
  if (!mockRedisClient) {
    mockRedisClient = new MockRedisClient();
    console.log('Mock Redis: Connected');
  }
  return mockRedisClient;
}

export async function cacheHotels(city: string, hotels: DeduplicatedHotel[]): Promise<void> {
  try {
    const client = await getMockRedisClient();
    const key = `hotels:${city.toLowerCase()}`;
    
    // Store hotels with expiration of 5 minutes
    await client.setEx(key, 300, JSON.stringify(hotels));
    console.log(`Cached ${hotels.length} hotels for city: ${city}`);
  } catch (error) {
    console.error('Error caching hotels:', error);
  }
}

export async function getCachedHotels(city: string): Promise<DeduplicatedHotel[] | null> {
  try {
    const client = await getMockRedisClient();
    const key = `hotels:${city.toLowerCase()}`;
    
    const cached = await client.get(key);
    if (cached) {
      console.log(`Retrieved cached hotels for city: ${city}`);
      return JSON.parse(cached);
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving cached hotels:', error);
    return null;
  }
}

export function filterHotelsByPrice(
  hotels: DeduplicatedHotel[], 
  minPrice?: number, 
  maxPrice?: number
): DeduplicatedHotel[] {
  return hotels.filter(hotel => {
    if (minPrice !== undefined && hotel.price < minPrice) {
      return false;
    }
    if (maxPrice !== undefined && hotel.price > maxPrice) {
      return false;
    }
    return true;
  });
}

export async function closeMockRedisConnection(): Promise<void> {
  if (mockRedisClient) {
    await mockRedisClient.quit();
    mockRedisClient = null;
  }
}