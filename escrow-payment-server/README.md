# Mock Escrow Payment Server

A dynamic middleware for managing virtual INR escrow payments using FastAPI. This server handles contract creation, payment initiation, work verification, and fund disbursement.

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. Navigate to the project directory:
```bash
cd escrow-payment-server
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

### Running the Server

#### Option 1: Using the Batch Script (Windows)
```bash
start_server.bat
```

#### Option 2: Using Python directly
```bash
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

#### Option 3: Running the main.py
```bash
python main.py
```

Once running, the server will be available at:
- **API**: http://127.0.0.1:8000
- **Interactive API Documentation**: http://127.0.0.1:8000/docs
- **Alternative API Documentation**: http://127.0.0.1:8000/redoc

---

## 📋 API Endpoints

### 1. Health Check
```http
GET /
```
Returns server status and version.

**Response:**
```json
{
  "status": "running",
  "service": "Mock Escrow Payment Server",
  "version": "1.0.0"
}
```

---

### 2. Create Contract
```http
POST /contracts
```

Create a new contract with buyer, seller, and amount details.

**Request Body:**
```json
{
  "buyer_id": "buyer_123",
  "seller_id": "seller_456",
  "amount": 50000.0
}
```

**Response (201 Created):**
```json
{
  "contract_id": "contract_a1b2c3d4e5f6",
  "buyer_id": "buyer_123",
  "seller_id": "seller_456",
  "amount": 50000.0,
  "status": "CREATED",
  "created_at": "2026-04-05T10:30:00.123456"
}
```

**Status Codes:**
- `200 OK` - Contract created successfully
- `422 Unprocessable Entity` - Invalid request body

---

### 3. Initiate Payment
```http
POST /initiate-payment/{contract_id}
```

Initiate payment for a contract. Simulates a 2-second payment gateway response.

**Path Parameters:**
- `contract_id` (string, required) - The contract ID

**Response:**
```json
{
  "message": "🔒 Payment of ₹50,000.00 received and secured in Escrow.",
  "contract_id": "contract_a1b2c3d4e5f6",
  "status": "LOCKED"
}
```

**Console Output:**
```
🔒 Payment of ₹50,000.00 received and secured in Escrow.
```

**Status Codes:**
- `200 OK` - Payment initiated successfully
- `404 Not Found` - Contract not found
- `400 Bad Request` - Contract not in CREATED status

**Rules:**
- Amount is automatically fetched from stored contract data
- Contract status must be CREATED
- Changes status to LOCKED

---

### 4. Verify Contract
```http
POST /verify-contract/{contract_id}
```

Verify contract completion (AI/ML or manual verification).

**Path Parameters:**
- `contract_id` (string, required) - The contract ID

**Response:**
```json
{
  "message": "✅ Contract contract_a1b2c3d4e5f6 verified. Work completed and approved.",
  "contract_id": "contract_a1b2c3d4e5f6",
  "status": "EXECUTED"
}
```

**Console Output:**
```
✅ Contract contract_a1b2c3d4e5f6 verified. Work completed and approved.
```

**Status Codes:**
- `200 OK` - Contract verified successfully
- `404 Not Found` - Contract not found
- `400 Bad Request` - Contract not in LOCKED status

**Rules:**
- Contract must be in LOCKED status
- Changes status to EXECUTED

---

### 5. Disburse Funds
```http
POST /disburse-funds/{contract_id}
```

Transfer funds to the seller after contract verification.

**Path Parameters:**
- `contract_id` (string, required) - The contract ID

**Response:**
```json
{
  "message": "💸 Transferring ₹50,000.00 to seller_456. Settlement Complete.",
  "contract_id": "contract_a1b2c3d4e5f6",
  "status": "COMPLETED"
}
```

**Console Output:**
```
💸 Transferring ₹50,000.00 to seller_456. Settlement Complete.
```

**Status Codes:**
- `200 OK` - Funds disbursed successfully
- `404 Not Found` - Contract not found
- `400 Bad Request` - Contract not in EXECUTED status

**Rules:**
- Contract must be in EXECUTED status
- Amount and seller_id are automatically fetched from contract data
- Never pass amount in the request
- Changes status to COMPLETED

---

### 6. Get Contract Status
```http
GET /contract-status/{contract_id}
```

Get complete contract details and current status for timeline visualization.

**Path Parameters:**
- `contract_id` (string, required) - The contract ID

**Response:**
```json
{
  "contract_id": "contract_a1b2c3d4e5f6",
  "buyer_id": "buyer_123",
  "seller_id": "seller_456",
  "amount": 50000.0,
  "status": "COMPLETED",
  "created_at": "2026-04-05T10:30:00.123456",
  "locked_at": "2026-04-05T10:32:02.654321",
  "verified_at": "2026-04-05T10:33:15.789012",
  "completed_at": "2026-04-05T10:33:45.345678"
}
```

**Status Codes:**
- `200 OK` - Contract found
- `404 Not Found` - Contract not found

**Timeline Progression:**
1. **CREATED** - Contract initialized
2. **LOCKED** - Payment secured in escrow
3. **EXECUTED** - Work verified and approved
4. **COMPLETED** - Funds disbursed to seller

---

### 7. List All Contracts
```http
GET /contracts
```

Retrieve all contracts with their current status.

**Response:**
```json
{
  "total_contracts": 2,
  "contracts": [
    {
      "contract_id": "contract_a1b2c3d4e5f6",
      "buyer_id": "buyer_123",
      "seller_id": "seller_456",
      "amount": 50000.0,
      "status": "COMPLETED"
    },
    {
      "contract_id": "contract_x9y8z7w6v5u4",
      "buyer_id": "buyer_789",
      "seller_id": "seller_012",
      "amount": 75000.0,
      "status": "LOCKED"
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Success

---

### 8. Filter Contracts by Status
```http
GET /contracts/status/{status}
```

Get all contracts with a specific status.

**Path Parameters:**
- `status` (string, required) - One of: CREATED, LOCKED, EXECUTED, COMPLETED, CANCELLED

**Response:**
```json
{
  "status": "COMPLETED",
  "count": 1,
  "contracts": [
    {
      "contract_id": "contract_a1b2c3d4e5f6",
      "buyer_id": "buyer_123",
      "seller_id": "seller_456",
      "amount": 50000.0,
      "status": "COMPLETED"
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Success
- `422 Unprocessable Entity` - Invalid status

---

### 9. Cancel Contract
```http
POST /contracts/{contract_id}/cancel
```

Cancel a contract (only if in CREATED or LOCKED status).

**Path Parameters:**
- `contract_id` (string, required) - The contract ID

**Response:**
```json
{
  "message": "Contract contract_a1b2c3d4e5f6 has been cancelled.",
  "contract_id": "contract_a1b2c3d4e5f6",
  "status": "CANCELLED"
}
```

**Status Codes:**
- `200 OK` - Contract cancelled successfully
- `404 Not Found` - Contract not found
- `400 Bad Request` - Cannot cancel contract in EXECUTED or COMPLETED status

**Rules:**
- Can only cancel contracts in CREATED or LOCKED status
- Cannot cancel contracts already EXECUTED or COMPLETED

---

## 🔄 Contract Lifecycle

```
┌─────────────┐
│   CREATED   │  (Initial state after contract creation)
└──────┬──────┘
       │ POST /initiate-payment/{contract_id}
       │ (2-second delay, funds held in escrow)
       ▼
┌─────────────┐
│   LOCKED    │  (Payment secured, awaiting verification)
└──────┬──────┘
       │ POST /verify-contract/{contract_id}
       │ (AI/ML or manual verification)
       ▼
┌─────────────┐
│  EXECUTED   │  (Work verified, ready for disbursement)
└──────┬──────┘
       │ POST /disburse-funds/{contract_id}
       │ (Transfer funds to seller)
       ▼
┌─────────────┐
│  COMPLETED  │  (Settlement complete, funds disbursed)
└─────────────┘
```

---

## 🧪 Example Workflow

### Step 1: Create a Contract
```bash
curl -X POST "http://127.0.0.1:8000/contracts" \
  -H "Content-Type: application/json" \
  -d '{
    "buyer_id": "buyer_001",
    "seller_id": "seller_001",
    "amount": 100000
  }'
```

**Response:**
```json
{
  "contract_id": "contract_abc123def456",
  "buyer_id": "buyer_001",
  "seller_id": "seller_001",
  "amount": 100000.0,
  "status": "CREATED",
  "created_at": "2026-04-05T11:00:00.000000"
}
```

### Step 2: Initiate Payment
```bash
curl -X POST "http://127.0.0.1:8000/initiate-payment/contract_abc123def456"
```

**Console Output:**
```
🔒 Payment of ₹100,000.00 received and secured in Escrow.
```

### Step 3: Verify Contract
```bash
curl -X POST "http://127.0.0.1:8000/verify-contract/contract_abc123def456"
```

**Console Output:**
```
✅ Contract contract_abc123def456 verified. Work completed and approved.
```

### Step 4: Disburse Funds
```bash
curl -X POST "http://127.0.0.1:8000/disburse-funds/contract_abc123def456"
```

**Console Output:**
```
💸 Transferring ₹100,000.00 to seller_001. Settlement Complete.
```

### Step 5: Check Final Status
```bash
curl -X GET "http://127.0.0.1:8000/contract-status/contract_abc123def456"
```

**Response:**
```json
{
  "contract_id": "contract_abc123def456",
  "buyer_id": "buyer_001",
  "seller_id": "seller_001",
  "amount": 100000.0,
  "status": "COMPLETED",
  "created_at": "2026-04-05T11:00:00.000000",
  "locked_at": "2026-04-05T11:00:02.500000",
  "verified_at": "2026-04-05T11:00:05.100000",
  "completed_at": "2026-04-05T11:00:06.800000"
}
```

---

## 🔐 Key Features

✅ **Dynamic Contract Management** - Create and manage contracts with unique IDs

✅ **Escrow Holding** - Funds are held securely until verification

✅ **Automatic Amount Fetching** - Amounts are never passed in payment/disbursement calls

✅ **Status Tracking** - Complete timeline of contract progression

✅ **Validation** - Ensures contracts follow proper state transitions

✅ **Console Alerts** - Real-time notifications of payment and settlement events

✅ **CORS Support** - Ready for frontend integration

✅ **Interactive API Docs** - Built-in Swagger UI at `/docs`

---

## 📦 Dependencies

- **fastapi** - Modern web framework for building APIs
- **uvicorn** - ASGI web server
- **pydantic** - Data validation using Python type annotations
- **python-multipart** - Support for form data parsing

---

## 🛠️ Architecture

```
main.py
├── Enums
│   └── ContractStatus (CREATED, LOCKED, EXECUTED, COMPLETED, CANCELLED)
├── Pydantic Models
│   ├── CreateContractRequest
│   ├── ContractResponse
│   ├── ContractStatusResponse
│   └── MessageResponse
├── Data Model
│   └── ContractData
├── FastAPI Application
│   ├── CORS Middleware
│   └── In-memory Database (contracts_db)
└── Endpoints (9 routes)
    ├── GET / (Health check)
    ├── POST /contracts
    ├── POST /initiate-payment/{contract_id}
    ├── POST /verify-contract/{contract_id}
    ├── POST /disburse-funds/{contract_id}
    ├── GET /contract-status/{contract_id}
    ├── GET /contracts
    ├── GET /contracts/status/{status}
    └── POST /contracts/{contract_id}/cancel
```

---

## 📝 Logging

The server logs all major events to the console with timestamps:

```
2026-04-05 11:00:00,000 - INFO - Contract created: contract_abc123def456 | Buyer: buyer_001 | Seller: seller_001 | Amount: ₹100,000.00
2026-04-05 11:00:00,100 - INFO - Processing payment for contract_abc123def456... (simulating 2s gateway delay)
2026-04-05 11:00:02,500 - INFO - Contract contract_abc123def456: 🔒 Payment of ₹100,000.00 received and secured in Escrow.
```

---

## 🚀 Integration with Frontend

The server is configured with CORS enabled for frontend integration:

```javascript
// Example: Create a contract from frontend
const response = await fetch('http://127.0.0.1:8000/contracts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    buyer_id: 'user_123',
    seller_id: 'seller_456',
    amount: 50000
  })
});

const contract = await response.json();
console.log(`Contract created: ${contract.contract_id}`);
```

---

## 🐛 Troubleshooting

### Port Already in Use
If port 8000 is already in use, modify the startup command:
```bash
python -m uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

### Dependencies Not Installing
```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

### Python Not Found
Ensure Python is installed and added to PATH. Check:
```bash
python --version
```

---

## 📄 License

This project is provided as-is for educational and development purposes.

---

## 👨‍💻 Development

For development with hot-reload:
```bash
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

The `--reload` flag enables automatic server restart on file changes.

---

**Version:** 1.0.0  
**Last Updated:** April 5, 2026
