/**
 * Redis Client Service - Production Redis caching implementation
 * 
 * @author Ankit Aditya <ankit.see@gmail.com>
 * @description Redis client for caching hotel data with price filtering capabilities
 */

import { createClient, RedisClientType } from 'redis';
import { DeduplicatedHotel } from '../types/hotel';

let redisClient: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Connected to Redis');
    });

    await redisClient.connect();
  }
  
  return redisClient;
}

export async function cacheHotels(city: string, hotels: DeduplicatedHotel[]): Promise<void> {
  try {
    const client = await getRedisClient();
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
    const client = await getRedisClient();
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

export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}