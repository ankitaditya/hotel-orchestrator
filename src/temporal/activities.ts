/**
 * Temporal Activities - Individual workflow tasks and operations
 * 
 * @author Ankit Aditya <ankit.see@gmail.com>
 * @description Temporal.io activities for supplier API calls and health checks
 */

import axios from 'axios';
import { Hotel, SupplierResponse } from '../types/hotel';

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

export async function checkSupplierHealth(supplierUrl: string): Promise<boolean> {
  try {
    const response = await axios.get(supplierUrl, { timeout: 3000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}