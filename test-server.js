/**
 * Hotel Offer Orchestrator - Simplified Test Server
 * 
 * @author Ankit Aditya <ankit.see@gmail.com>
 * @description Simplified Node.js server with all core functionality for testing
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Mock data
const delhiHotelsA = [
  { hotelId: "a1", name: "Holtin", price: 6000, city: "delhi", commissionPct: 10 },
  { hotelId: "a2", name: "Radison", price: 5900, city: "delhi", commissionPct: 13 },
  { hotelId: "a3", name: "Taj Palace", price: 8500, city: "delhi", commissionPct: 15 },
  { hotelId: "a4", name: "ITC Maurya", price: 7200, city: "delhi", commissionPct: 12 },
  { hotelId: "a5", name: "Oberoi", price: 9500, city: "delhi", commissionPct: 18 }
];

const delhiHotelsB = [
  { hotelId: "b1", name: "Holtin", price: 5340, city: "delhi", commissionPct: 20 },
  { hotelId: "b2", name: "Radison", price: 6200, city: "delhi", commissionPct: 15 },
  { hotelId: "b3", name: "Taj Palace", price: 8200, city: "delhi", commissionPct: 17 },
  { hotelId: "b4", name: "Leela Palace", price: 9800, city: "delhi", commissionPct: 22 },
  { hotelId: "b5", name: "Shangri-La", price: 8900, city: "delhi", commissionPct: 19 }
];

const mumbaiHotelsA = [
  { hotelId: "a6", name: "Hyatt Regency", price: 6800, city: "mumbai", commissionPct: 14 },
  { hotelId: "a7", name: "Marriott", price: 7500, city: "mumbai", commissionPct: 16 }
];

const mumbaiHotelsB = [
  { hotelId: "b6", name: "Hyatt Regency", price: 6500, city: "mumbai", commissionPct: 18 },
  { hotelId: "b7", name: "Four Seasons", price: 11000, city: "mumbai", commissionPct: 25 }
];

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Hotel Offer Orchestrator API',
    version: '1.0.0',
    endpoints: {
      hotels: '/api/hotels?city=<city>&minPrice=<min>&maxPrice=<max>',
      supplierA: '/supplierA/hotels?city=<city>',
      supplierB: '/supplierB/hotels?city=<city>',
      health: '/health'
    }
  });
});

// Supplier A endpoint
app.get('/supplierA/hotels', (req, res) => {
  const { city } = req.query;
  
  if (!city) {
    return res.status(400).json({ error: 'City parameter is required' });
  }
  
  const cityLower = city.toLowerCase();
  let hotels = [];
  
  if (cityLower === 'delhi') {
    hotels = delhiHotelsA;
  } else if (cityLower === 'mumbai') {
    hotels = mumbaiHotelsA;
  }
  
  // Simulate some delay
  setTimeout(() => {
    res.json(hotels);
  }, Math.random() * 500 + 100);
});

// Supplier B endpoint
app.get('/supplierB/hotels', (req, res) => {
  const { city } = req.query;
  
  if (!city) {
    return res.status(400).json({ error: 'City parameter is required' });
  }
  
  const cityLower = city.toLowerCase();
  let hotels = [];
  
  if (cityLower === 'delhi') {
    hotels = delhiHotelsB;
  } else if (cityLower === 'mumbai') {
    hotels = mumbaiHotelsB;
  }
  
  // Simulate some delay
  setTimeout(() => {
    res.json(hotels);
  }, Math.random() * 500 + 100);
});

// Hotel comparison function
async function compareHotels(city) {
  console.log(`Starting hotel comparison for city: ${city}`);
  
  // Fetch from both suppliers
  const [supplierAResponse, supplierBResponse] = await Promise.all([
    fetch(`http://localhost:${PORT}/supplierA/hotels?city=${city}`).then(r => r.json()),
    fetch(`http://localhost:${PORT}/supplierB/hotels?city=${city}`).then(r => r.json())
  ]);

  console.log(`Supplier A: ${supplierAResponse.length} hotels`);
  console.log(`Supplier B: ${supplierBResponse.length} hotels`);

  // Combine all hotels
  const allHotels = [];
  
  supplierAResponse.forEach(hotel => {
    allHotels.push({ hotel, supplier: 'Supplier A' });
  });
  
  supplierBResponse.forEach(hotel => {
    allHotels.push({ hotel, supplier: 'Supplier B' });
  });

  // Deduplicate by name and select best price
  const hotelMap = new Map();
  
  allHotels.forEach(({ hotel, supplier }) => {
    const hotelName = hotel.name.toLowerCase();
    
    if (!hotelMap.has(hotelName)) {
      hotelMap.set(hotelName, {
        name: hotel.name,
        price: hotel.price,
        supplier: supplier,
        commissionPct: hotel.commissionPct
      });
      console.log(`Added ${hotel.name} from ${supplier} at ₹${hotel.price}`);
    } else {
      const existingHotel = hotelMap.get(hotelName);
      if (hotel.price < existingHotel.price) {
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

  const result = Array.from(hotelMap.values()).sort((a, b) => a.price - b.price);
  console.log(`Final result: ${result.length} deduplicated hotels`);
  
  return result;
}

// Cache for hotels
const cache = new Map();

// Main hotels endpoint
app.get('/api/hotels', async (req, res) => {
  try {
    const { city, minPrice, maxPrice } = req.query;

    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    const minPriceNum = minPrice ? parseFloat(minPrice) : undefined;
    const maxPriceNum = maxPrice ? parseFloat(maxPrice) : undefined;

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

    // Check cache
    const cacheKey = city.toLowerCase();
    let hotels = cache.get(cacheKey);

    if (!hotels) {
      console.log('No cached results found, executing hotel comparison');
      hotels = await compareHotels(city);
      
      // Cache for 5 minutes
      cache.set(cacheKey, hotels);
      setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000);
    } else {
      console.log('Using cached results');
    }

    // Apply price filtering
    const filteredHotels = hotels.filter(hotel => {
      if (minPriceNum !== undefined && hotel.price < minPriceNum) {
        return false;
      }
      if (maxPriceNum !== undefined && hotel.price > maxPriceNum) {
        return false;
      }
      return true;
    });

    res.json(filteredHotels);

  } catch (error) {
    console.error('Error in hotels endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    console.log('Executing health check');
    
    const [supplierAHealth, supplierBHealth] = await Promise.all([
      fetch(`http://localhost:${PORT}/supplierA/hotels?city=delhi`).then(r => r.ok).catch(() => false),
      fetch(`http://localhost:${PORT}/supplierB/hotels?city=delhi`).then(r => r.ok).catch(() => false)
    ]);

    const healthStatus = {
      status: (supplierAHealth && supplierBHealth) ? 'healthy' : 'unhealthy',
      suppliers: {
        supplierA: supplierAHealth ? 'healthy' : 'unhealthy',
        supplierB: supplierBHealth ? 'healthy' : 'unhealthy'
      },
      timestamp: new Date().toISOString()
    };

    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthStatus);

  } catch (error) {
    console.error('Error in health check endpoint:', error);
    
    const errorHealthStatus = {
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Hotel Offer Orchestrator API running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET /                     - API information`);
  console.log(`  GET /api/hotels           - Get deduplicated hotels`);
  console.log(`  GET /supplierA/hotels     - Supplier A mock API`);
  console.log(`  GET /supplierB/hotels     - Supplier B mock API`);
  console.log(`  GET /health               - Health check`);
  console.log(`\nExample: curl "http://localhost:${PORT}/api/hotels?city=delhi&minPrice=5000&maxPrice=8000"`);
});