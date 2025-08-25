/**
 * Mock Data Service - Test data for supplier APIs
 * 
 * @author Ankit Aditya <ankit.see@gmail.com>
 * @description Mock hotel data for Supplier A and Supplier B with overlapping entries
 */

import { Hotel } from '../types/hotel';

export const supplierAData: Hotel[] = [
  {
    hotelId: "a1",
    name: "Holtin",
    price: 6000,
    city: "delhi",
    commissionPct: 10
  },
  {
    hotelId: "a2",
    name: "Radison",
    price: 5900,
    city: "delhi",
    commissionPct: 13
  },
  {
    hotelId: "a3",
    name: "Taj Palace",
    price: 8500,
    city: "delhi",
    commissionPct: 15
  },
  {
    hotelId: "a4",
    name: "ITC Maurya",
    price: 7200,
    city: "delhi",
    commissionPct: 12
  },
  {
    hotelId: "a5",
    name: "Oberoi",
    price: 9500,
    city: "delhi",
    commissionPct: 18
  },
  {
    hotelId: "a6",
    name: "Hyatt Regency",
    price: 6800,
    city: "mumbai",
    commissionPct: 14
  },
  {
    hotelId: "a7",
    name: "Marriott",
    price: 7500,
    city: "mumbai",
    commissionPct: 16
  }
];

export const supplierBData: Hotel[] = [
  {
    hotelId: "b1",
    name: "Holtin",
    price: 5340,
    city: "delhi",
    commissionPct: 20
  },
  {
    hotelId: "b2",
    name: "Radison",
    price: 6200,
    city: "delhi",
    commissionPct: 11
  },
  {
    hotelId: "b3",
    name: "Taj Palace",
    price: 8200,
    city: "delhi",
    commissionPct: 17
  },
  {
    hotelId: "b4",
    name: "Leela Palace",
    price: 9800,
    city: "delhi",
    commissionPct: 19
  },
  {
    hotelId: "b5",
    name: "Shangri-La",
    price: 8900,
    city: "delhi",
    commissionPct: 16
  },
  {
    hotelId: "b6",
    name: "Hyatt Regency",
    price: 6500,
    city: "mumbai",
    commissionPct: 15
  },
  {
    hotelId: "b7",
    name: "Four Seasons",
    price: 11000,
    city: "mumbai",
    commissionPct: 22
  }
];

// Simulate supplier availability (for health checks)
export let supplierAHealthy = true;
export let supplierBHealthy = true;

export const setSupplierAHealth = (healthy: boolean) => {
  supplierAHealthy = healthy;
};

export const setSupplierBHealth = (healthy: boolean) => {
  supplierBHealthy = healthy;
};