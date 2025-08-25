/**
 * Hotel Type Definitions - TypeScript interfaces for hotel data structures
 * 
 * @author Ankit Aditya <ankit.see@gmail.com>
 * @description Type definitions for hotel entities, search parameters, and API responses
 */

export interface Hotel {
  hotelId: string;
  name: string;
  price: number;
  city: string;
  commissionPct: number;
}

export interface DeduplicatedHotel {
  name: string;
  price: number;
  supplier: string;
  commissionPct: number;
}

export interface SupplierResponse {
  supplier: string;
  hotels: Hotel[];
  success: boolean;
  error?: string;
}

export interface HotelSearchParams {
  city: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  suppliers: {
    supplierA: 'healthy' | 'unhealthy';
    supplierB: 'healthy' | 'unhealthy';
  };
  timestamp: string;
}