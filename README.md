# Hotel Offer Orchestrator

**Author:** Ankit Aditya (ankit.see@gmail.com)

A comprehensive hotel offer aggregation system built with Node.js, TypeScript, Express, Temporal.io, and Redis. This system aggregates hotel offers from multiple suppliers, deduplicates them, and returns the best-priced options.

## 🏗️ Architecture

- **Express.js**: REST API server
- **TypeScript**: Type-safe development
- **Temporal.io**: Workflow orchestration for supplier calls
- **Redis**: Caching and price filtering
- **Docker Compose**: Multi-service deployment

## 🚀 Features

- **Parallel Supplier Calls**: Uses Temporal.io to call multiple suppliers concurrently
- **Hotel Deduplication**: Automatically deduplicates hotels by name and selects the best price
- **Price Filtering**: Filter results by minimum and maximum price ranges
- **Caching**: Redis-based caching for improved performance
- **Health Monitoring**: Health check endpoint for supplier status
- **Mock Suppliers**: Built-in mock supplier APIs for testing
- **Containerized**: Full Docker Compose setup with all dependencies

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- npm or yarn

## 🛠️ Quick Start with Docker

1. **Clone and navigate to the project:**
   ```bash
   git clone <repository-url>
   cd hotel-offer-orchestrator
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Wait for services to be ready** (about 30-60 seconds for Temporal to initialize)

4. **Test the API:**
   ```bash
   curl "http://localhost:3000/api/hotels?city=delhi"
   ```

## 🚀 Quick Test (Simplified Server)

For immediate testing without Docker dependencies:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the test server:**
   ```bash
   node test-server.js
   ```

3. **Test the API:**
   ```bash
   curl "http://localhost:3000/api/hotels?city=delhi"
   ```

This simplified server includes all core functionality: hotel deduplication, price filtering, caching, and health checks.

## 🔧 Full Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start Redis and Temporal (using Docker):**
   ```bash
   docker-compose up redis temporal postgresql -d
   ```

3. **Build the TypeScript code:**
   ```bash
   npm run build
   ```

4. **Start the Temporal worker (in one terminal):**
   ```bash
   npm run temporal:worker
   ```

5. **Start the API server (in another terminal):**
   ```bash
   npm run dev
   ```

## 📡 API Endpoints

### Main API

#### Get Hotels
```
GET /api/hotels?city=<city>&minPrice=<min>&maxPrice=<max>
```

**Parameters:**
- `city` (required): City name (e.g., "delhi", "mumbai")
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter

**Example:**
```bash
curl "http://localhost:3000/api/hotels?city=delhi&minPrice=5000&maxPrice=8000"
```

**Response:**
```json
[
  {
    "name": "Holtin",
    "price": 5340,
    "supplier": "Supplier B",
    "commissionPct": 20
  },
  {
    "name": "Radison",
    "price": 5900,
    "supplier": "Supplier A",
    "commissionPct": 13
  }
]
```

### Health Check

#### System Health
```
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "suppliers": {
    "supplierA": "healthy",
    "supplierB": "healthy"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Mock Supplier APIs

#### Supplier A
```
GET /supplierA/hotels?city=<city>
```

#### Supplier B
```
GET /supplierB/hotels?city=<city>
```

## 🧪 Testing with Postman

1. **Import the collection:**
   - Open Postman
   - Import `Hotel-Orchestrator.postman_collection.json`

2. **Set the base URL:**
   - Update the `baseUrl` variable to `http://localhost:3000`

3. **Run the tests:**
   - Test basic hotel search
   - Test price filtering
   - Test error scenarios
   - Test supplier health checks

## 🏨 Sample Data

The system includes mock data for two cities:

### Delhi Hotels
- **Holtin**: Supplier A (₹6000), Supplier B (₹5340) → Best: Supplier B
- **Radison**: Supplier A (₹5900), Supplier B (₹6200) → Best: Supplier A
- **Taj Palace**: Supplier A (₹8500), Supplier B (₹8200) → Best: Supplier B
- **ITC Maurya**: Supplier A only (₹7200)
- **Oberoi**: Supplier A only (₹9500)
- **Leela Palace**: Supplier B only (₹9800)
- **Shangri-La**: Supplier B only (₹8900)

### Mumbai Hotels
- **Hyatt Regency**: Supplier A (₹6800), Supplier B (₹6500) → Best: Supplier B
- **Marriott**: Supplier A only (₹7500)
- **Four Seasons**: Supplier B only (₹11000)

## 🔄 How It Works

1. **Request Processing**: API receives a request for hotels in a specific city
2. **Cache Check**: System checks Redis for cached results
3. **Temporal Workflow**: If no cache, Temporal orchestrates parallel supplier calls
4. **Data Aggregation**: Results from both suppliers are combined
5. **Deduplication**: Hotels with the same name are deduplicated, keeping the best price
6. **Caching**: Results are cached in Redis for 5 minutes
7. **Price Filtering**: Results are filtered based on price parameters
8. **Response**: Final deduplicated and filtered list is returned

## 🐳 Docker Services

The Docker Compose setup includes:

- **hotel-api**: Main API service (port 3000)
- **temporal-worker**: Temporal workflow worker
- **temporal**: Temporal server (ports 7233, 8233)
- **postgresql**: Database for Temporal
- **redis**: Caching service (port 6379)

## 🔍 Monitoring and Logs

### View logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f hotel-api
docker-compose logs -f temporal-worker
```

### Access Temporal Web UI:
```
http://localhost:8233
```

### Access Redis CLI:
```bash
docker-compose exec redis redis-cli
```

## ✅ Test Results

The system has been tested and verified with the following scenarios:

### Successful Test Cases:

1. **Hotel Deduplication**: 
   - Supplier A: Holtin (₹6000), Radison (₹5900), Taj Palace (₹8500)
   - Supplier B: Holtin (₹5340), Radison (₹6200), Taj Palace (₹8200)
   - Result: Best prices selected (Holtin ₹5340 from B, Radison ₹5900 from A, Taj Palace ₹8200 from B)

2. **Price Filtering**:
   - Query: `?city=delhi&minPrice=5000&maxPrice=8000`
   - Result: Only hotels within price range returned

3. **Health Check**:
   - Both suppliers healthy: Status 200
   - Supplier status individually tracked

4. **Error Handling**:
   - Missing city parameter: 400 error
   - Invalid price parameters: 400 error
   - Unknown city: Empty array returned

5. **Caching**:
   - First request: Calls both suppliers
   - Subsequent requests: Uses cached data (5-minute expiration)

## 🛠️ Development Commands

```bash
# Build TypeScript
npm run build

# Start development server
npm run dev

# Start Temporal worker
npm run temporal:worker

# Start production server
npm start
```

## 🚨 Troubleshooting

### Common Issues:

1. **Temporal connection errors:**
   - Ensure Temporal server is running: `docker-compose ps temporal`
   - Wait for Temporal to fully initialize (30-60 seconds)

2. **Redis connection errors:**
   - Check Redis status: `docker-compose ps redis`
   - Verify Redis is accessible: `docker-compose exec redis redis-cli ping`

3. **Port conflicts:**
   - Check if ports 3000, 6379, 7233, 8233, 5432 are available
   - Modify docker-compose.yml if needed

4. **Worker not processing workflows:**
   - Ensure temporal-worker service is running
   - Check worker logs: `docker-compose logs temporal-worker`

### Reset Everything:
```bash
docker-compose down -v
docker-compose up -d
```

## 📝 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | API server port |
| `REDIS_URL` | redis://localhost:6379 | Redis connection URL |
| `BASE_URL` | http://localhost:3000 | Base URL for internal calls |
| `NODE_ENV` | development | Environment mode |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🔗 External Access

When deployed, the API is accessible at:
- Local: http://localhost:3000

## 📊 Performance Notes

- **Caching**: Results are cached for 5 minutes to improve response times
- **Parallel Processing**: Supplier calls are made concurrently using Temporal
- **Connection Pooling**: Redis and database connections are pooled for efficiency
- **Graceful Shutdown**: Proper cleanup of connections on application termination