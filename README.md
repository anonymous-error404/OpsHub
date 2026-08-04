# OpsHub — SMB One-Stop Blockchain Platform

> A hybrid Web2 + Web3 financial infrastructure for Small & Medium Businesses (SMBs), providing blockchain-backed payment auditability, escrow orchestration, and a business networking layer — all with traditional INR payments via Razorpay.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Tech Stack](#tech-stack)
- [Modules](#modules)
  - [OpsHub Frontend](#1-opshub-frontend)
  - [OpsHub Backend](#2-opshub-backend)
  - [OpsHub Web3 (Smart Contracts)](#3-opshub-web3-smart-contracts)
  - [Escrow Payment Server](#4-escrow-payment-server)
  - [SMB One Web](#5-smb-one-web)
- [Smart Contracts](#smart-contracts)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Escrow Lifecycle](#escrow-lifecycle)
- [Security Model](#security-model)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Future Enhancements](#future-enhancements)

---

## Overview

**OpsHub** is a college major project that demonstrates how blockchain technology can be integrated into a traditional SMB (Small & Medium Business) financial platform without requiring businesses to understand or manage crypto wallets.

The core philosophy is:

> **Blockchain as a proof and audit layer — not a payment processor.**

Real payments happen in Indian Rupees (INR) via Razorpay. Blockchain records immutable hashes of those payment events on the Ethereum Sepolia testnet, providing tamper-proof receipts, escrow lifecycle proofs, and a full audit trail.

### Key Features

| Feature | Description |
|---|---|
| 🔐 **Blockchain Identity** | Each SMB business is registered on-chain via `BusinessRegistry.sol` |
| 💸 **Payment Recording** | Razorpay payments are hashed and anchored to the blockchain via `TransactionLedger.sol` |
| 🤝 **Escrow System** | Multi-party escrow with lifecycle management, recorded on-chain via `EscrowRegistry.sol` |
| 🌐 **Business Network** | SMBs can connect with each other, view mutual connections, and initiate deals |
| 📊 **Analytics Dashboard** | Transaction volume, completion rates, overdue escrows, and partner trust scores |
| 👛 **Custodial Wallets** | Auto-generated wallets with encrypted private keys — no MetaMask needed for users |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User (Browser)                           │
│               OpsHub React Frontend (Vite + React)              │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP (REST API)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│               OpsHub Backend (Node.js + Express)                │
│  Auth │ Payments │ Escrow │ Blockchain │ Network │ Transactions  │
└───────┬──────────────────┬──────────────────────────────────────┘
        │                  │
        │ ethers.js        │ axios (HTTP)
        ▼                  ▼
┌───────────────┐  ┌───────────────────────────────────────────┐
│  Ethereum     │  │   Escrow Payment Server (Python FastAPI)  │
│  Sepolia      │  │   Handles contract lifecycle simulation   │
│  Testnet      │  └───────────────────────────────────────────┘
│               │
│  Smart Contracts:         │
│  - BusinessRegistry       │
│  - TransactionLedger      │
│  - EscrowRegistry         │
└───────────────┘
        │
        │ Off-chain metadata
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                          │
│          users │ payments │ escrow_contracts │ network          │
└─────────────────────────────────────────────────────────────────┘
```

**Data Flow Summary:**
1. User authenticates → JWT issued
2. Payment processed via Razorpay (INR)
3. Backend creates SHA-256 hash of payment metadata
4. Hash anchored to Ethereum Sepolia via `TransactionLedger.sol`
5. Full payment data stored in PostgreSQL
6. For escrow: Python FastAPI server manages fund lock/release lifecycle
7. Escrow lifecycle events also recorded on-chain via `EscrowRegistry.sol`

---

## Repository Structure

```
Major Project/
├── OpsHub-frontend/          # React + Vite dashboard application
├── OpsHub-backend/           # Node.js + Express REST API server
├── OpsHub-web3/              # Hardhat smart contract project
├── escrow-payment-server/    # Python FastAPI escrow simulation service
└── smb-one-web/              # SMB landing/marketing web app (React + Tailwind)
```

---

## Tech Stack

### Frontend (`OpsHub-frontend`)
| Technology | Version | Purpose |
|---|---|---|
| React | 19.x | UI framework |
| Vite | 8.x | Build tool & dev server |
| Framer Motion | 12.x | Animations & transitions |
| Chart.js + react-chartjs-2 | 4.x / 5.x | Analytics charts |
| Lucide React | 1.x | Icon library |
| Axios | 1.x | HTTP client |

### Backend (`OpsHub-backend`)
| Technology | Version | Purpose |
|---|---|---|
| Node.js + Express | 5.x | REST API server |
| PostgreSQL (`pg`) | 8.x | Primary database |
| Ethers.js | 6.x | Blockchain interaction |
| Razorpay | 2.x | Payment gateway |
| JWT (`jsonwebtoken`) | 9.x | Authentication |
| bcrypt | 6.x | Password hashing |
| crypto-js | 4.x | Wallet key encryption |
| UUID | 13.x | Unique ID generation |

### Smart Contracts (`OpsHub-web3`)
| Technology | Version | Purpose |
|---|---|---|
| Solidity | ^0.8.24 | Smart contract language |
| Hardhat | 2.x | Contract dev environment |
| Ethers.js | 6.x | Contract deployment |
| Sepolia Testnet | — | Deployment target |

### Escrow Server (`escrow-payment-server`)
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.x | Runtime |
| FastAPI | 0.104.1 | Web framework |
| Uvicorn | 0.24.0 | ASGI server |
| Pydantic | 2.5.0 | Data validation |

---

## Modules

### 1. OpsHub Frontend

**Location:** `OpsHub-frontend/`

A React single-page application providing the full SMB dashboard experience.

**Pages:**

| Page | Route Key | Description |
|---|---|---|
| Login | `login` | Authentication with JWT session persistence |
| Dashboard | `dashboard` | Analytics, transaction summaries, escrow stats |
| Transactions | `transactions` | Full transaction history with blockchain proof links |
| Smart Contracts | `smart-contracts` | Escrow contract management, creation, completion |
| Network | `network` | Business network — connect, discover, manage relationships |
| Settings | `settings` | Account management, blockchain wallet onboarding |

**Key Components:**

- `Layout.jsx` — Sidebar + content wrapper
- `Sidebar.jsx` — Navigation sidebar with active tab highlighting
- `Toast.jsx` — Global notification system (success / error / info)
- `Modal.jsx` — Reusable modal dialog
- `AddressReveal.jsx` — Secure wallet address display with copy
- `LoadingSkeleton.jsx` — Skeleton loading states

**Running locally:**
```bash
cd OpsHub-frontend
npm install
npm run dev
# Runs at http://localhost:5173
```

---

### 2. OpsHub Backend

**Location:** `OpsHub-backend/`

A Node.js + Express REST API server that orchestrates auth, payments, blockchain interaction, and escrow management. Runs on **port 3000**.

**Services:**

| Service | File | Responsibility |
|---|---|---|
| `AuthService` | `AuthService.js` | SHA-256 password verification + JWT issuance |
| `UserService` | `UserService.js` | User CRUD, blockchain enable/disable |
| `WalletService` | `WalletService.js` | Custodial wallet generation + key encryption |
| `BlockchainService` | `BlockchainService.js` | Ethers.js provider, contract calls |
| `BlockchainOnboardingService` | `BlockchainOnboardingService.js` | New user wallet setup + on-chain registration |
| `BlockchainStatusService` | `BlockchainStatusService.js` | Blockchain enable/disable status checks |
| `TransactionService` | `TransactionService.js` | Records payment proofs on `TransactionLedger.sol` |
| `EscrowService` | `EscrowService.js` | Full escrow orchestration (create → pay → complete) |
| `NetworkService` | `NetworkService.js` | Connection requests, mutual connections, user discovery |
| `PaymentService` | `PaymentService.js` | Razorpay webhook handler |
| `PaymentRepository` | `PaymentRepository.js` | Payment DB persistence |

**Running locally:**
```bash
cd OpsHub-backend
npm install
node src/server.js
# or with auto-reload:
npx nodemon src/server.js
# Runs at http://localhost:3000
```

---

### 3. OpsHub Web3 (Smart Contracts)

**Location:** `OpsHub-web3/`

A Hardhat project containing three Solidity smart contracts deployed on the Ethereum **Sepolia** testnet.

**Deployed Contracts (Sepolia):**

| Contract | Address |
|---|---|
| BusinessRegistry | `0x9A106D7eFC2eDe0d8fD23DB74AD16F357856dD74` |
| TransactionLedger | `0x671850d237fAFfDD07fFC6c5Ae0dc8D5522a86DE` |
| EscrowRegistry | `0x116f1fFC1b727616faAF8b62917fE3266a189fBE` |

**Deploying contracts:**
```bash
cd OpsHub-web3
npm install
npx hardhat ignition deploy
```

---

### 4. Escrow Payment Server

**Location:** `escrow-payment-server/`

A Python FastAPI microservice that simulates an escrow payment processor. It manages the fund locking, delivery confirmation, and disbursement lifecycle for each escrow contract. Runs on **port 8081**.

**Contract Status Lifecycle:**
```
CREATED → LOCKED → EXECUTED → COMPLETED
                 ↘ CANCELLED
```

**Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/contracts` | Create a new escrow contract |
| `POST` | `/initiate-payment/{contract_id}` | Lock funds into escrow (simulates 2s gateway delay) |
| `POST` | `/verify-contract/{contract_id}` | Mark work as verified (LOCKED → EXECUTED) |
| `POST` | `/confirm-delivery/{contract_id}` | Buyer confirms delivery (LOCKED → EXECUTED) |
| `POST` | `/disburse-funds/{contract_id}` | Release funds to seller (EXECUTED → COMPLETED) |
| `POST` | `/contracts/{contract_id}/cancel` | Cancel a CREATED or LOCKED contract |
| `GET` | `/contract-status/{contract_id}` | Get full contract details + timestamps |
| `GET` | `/contracts` | List all contracts |
| `GET` | `/contracts/status/{status}` | Filter contracts by status |
| `GET` | `/buyer` | Serve buyer UI |
| `GET` | `/seller` | Serve seller UI |

**Running locally:**
```bash
cd escrow-payment-server
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8081
# Runs at http://localhost:8081
# Interactive API docs at http://localhost:8081/docs
```

---

### 5. SMB One Web

**Location:** `smb-one-web/`

A React + TypeScript + Tailwind CSS marketing/landing web app for the SMB One platform. Built with Vite, uses shadcn/ui components.

**Running locally:**
```bash
cd smb-one-web/SMB/smb.main
npm install
npm run dev
```

---

## Smart Contracts

### `BusinessRegistry.sol`

Maintains on-chain identity records for SMB businesses.

```solidity
struct Business {
    string name;
    address owner;
    uint created;
    bool exists;
}

function registerBusiness(address owner, string memory name) public
function getBusiness(address user) public view returns (string, address, uint, bool)
```

- **Role:** Identity layer
- **One business per address** — enforced on-chain with a `require(!businesses[owner].exists)` guard
- **Events:** `BusinessRegistered(address owner, string name)`

---

### `TransactionLedger.sol`

Immutable financial proof ledger. Stores SHA-256 hashes of payment metadata — full payment data lives off-chain in PostgreSQL.

```solidity
struct Transaction {
    uint id;
    address from;
    address to;
    uint amount;
    string razorpayPaymentId;
    string metadataHash;    // SHA-256 of full payment JSON
    uint timestamp;
}

function recordTransaction(address from, address to, uint amount,
                            string paymentId, string metadataHash) public onlyOwner
function getTransaction(uint id) public view returns (...)
function getBusinessTransactions(address business) public view returns (uint[])
```

- **Role:** Financial proof ledger
- **`onlyOwner` modifier** — only the server wallet can record transactions
- **Events:** `TransactionRecorded(uint id, address from, address to, uint amount, string paymentId)`

---

### `EscrowRegistry.sol`

Escrow lifecycle proof registry. Records each escrow deal's creation and completion on-chain.

```solidity
struct EscrowDeal {
    uint id;
    string escrowId;
    address buyer;
    address seller;
    uint amount;
    string status;       // "LOCKED" or "COMPLETED"
    string metadataHash; // SHA-256 of escrow state snapshot
    uint timestamp;
}

function recordEscrow(string escrowId, address buyer, address seller,
                       uint amount, string status, string metadataHash) public onlyOwner
function completeEscrow(uint id, string status) public onlyOwner
function getEscrow(uint id) public view returns (...)
```

- **Role:** Escrow lifecycle registry
- **`onlyOwner` modifier** — only the server wallet can write
- **Events:** `EscrowCreated(uint id, string escrowId, address buyer, address seller, uint amount)`, `EscrowCompleted(uint id, string status)`

---

## Database Schema

The backend uses **PostgreSQL** (`smb_one_db`). Key tables:

### `users`
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `email` | VARCHAR | Unique login identifier |
| `name` | VARCHAR | Display name |
| `password` | VARCHAR | SHA-256 hashed password |
| `wallet_address` | VARCHAR | Auto-generated ETH wallet |
| `wallet_private_key` | VARCHAR | AES-encrypted private key |
| `blockchain_enabled` | BOOLEAN | Whether blockchain features are active |
| `blockchain_tx` | VARCHAR | Registration transaction hash |

### `escrow_contracts`
| Column | Type | Description |
|---|---|---|
| `escrow_id` | VARCHAR | Python escrow server contract ID |
| `buyer_wallet` | VARCHAR | Buyer's ETH address |
| `seller_wallet` | VARCHAR | Seller's ETH address |
| `amount` | NUMERIC | Deal amount in INR |
| `status` | VARCHAR | `PENDING_PAYMENT` / `LOCKED_ON_CHAIN` / `COMPLETED` |
| `blockchain_deal_id` | INTEGER | `EscrowRegistry.sol` deal counter ID |
| `blockchain_tx` | VARCHAR | Completion transaction hash / payment proof |
| `initiator_wallet` | VARCHAR | Who initiated the deal |
| `deadline` | TIMESTAMP | Deal deadline |
| `created_at` | TIMESTAMP | Record creation time |

### `payments`
| Column | Type | Description |
|---|---|---|
| `razorpay_payment_id` | VARCHAR | Razorpay payment ID |
| `from_wallet` | VARCHAR | Payer wallet address |
| `to_wallet` | VARCHAR | Payee wallet address |
| `amount` | NUMERIC | Payment amount (INR) |
| `blockchain_hash` | VARCHAR | Blockchain transaction hash |
| `metadata_hash` | VARCHAR | SHA-256 of payment JSON |
| `full_json` | JSONB | Complete payment data |

### `network_connections`
| Column | Type | Description |
|---|---|---|
| `id` | SERIAL | Primary key |
| `user_a` | VARCHAR | Initiator email |
| `user_b` | VARCHAR | Recipient email |
| `status` | VARCHAR | `PENDING` / `CONNECTED` |

---

## API Reference

**Base URL:** `http://localhost:3000`

### Authentication

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/auth/login` | `{ email, password }` | Login — returns JWT token + user object |
| `POST` | `/auth/register` | `{ email, password, name }` | Register new SMB user |

### Payments

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/payments/create-order` | `{ amount }` | Create Razorpay order (returns `order_id`, `amount`, `key_id`) |
| `POST` | `/payments/verify-payment` | `{ order_id, payment_id, signature }` | Verify HMAC-SHA256 Razorpay signature |
| `POST` | `/payments/razorpay/webhook` | Razorpay payload | Process payment & record on blockchain |

### Escrow

| Method | Endpoint | Body / Params | Description |
|---|---|---|---|
| `POST` | `/escrow/request` | `{ buyerEmail, sellerEmail, amount, deadlineDays }` | Initiate escrow deal |
| `POST` | `/escrow/pay` | `{ escrowId, paymentId }` | Lock payment + record on blockchain |
| `POST` | `/escrow/complete` | `{ escrowId }` | Complete deal + disburse + blockchain proof |
| `GET` | `/escrow/user/:email` | — | Get all escrows for a user |
| `GET` | `/escrow/analytics/:email` | — | Get escrow analytics (volume, completion rate, overdue count) |
| `GET` | `/escrow/relationship/:email/:partnerEmail` | — | Get trust score between two businesses |

### Network

| Method | Endpoint | Body / Params | Description |
|---|---|---|---|
| `POST` | `/network/request` | `{ userA, userB }` | Send connection request |
| `POST` | `/network/accept` | `{ userA, userB }` | Accept a pending connection |
| `POST` | `/network/disconnect` | `{ userA, userB }` | Remove a connection |
| `GET` | `/network/mutuals/:userId` | — | Get all connected businesses with details |
| `GET` | `/network/all/:userId` | — | Discover all blockchain-enabled users |
| `GET` | `/network/pending/:userId` | — | Get incoming connection requests |

### Blockchain

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/blockchain/onboard` | Create wallet + register on `BusinessRegistry.sol` |
| `GET` | `/blockchain/status/:email` | Check if blockchain is enabled for user |

### Transactions

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/transactions/:email` | Get on-chain transaction history for a user |

### Payment History

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/payments/history/:email` | Get full payment history for a user |

---

## Escrow Lifecycle

The full escrow flow coordinates three systems — the Node backend, the Python escrow server, and the Ethereum blockchain:

```
1. INITIATION
   Buyer ──POST /escrow/request──► Node Backend
          Node Backend ──POST /contracts──► Python Escrow Server
          Python returns contract_id
          Node stores in PostgreSQL (status: PENDING_PAYMENT)

2. PAYMENT (Buyer pays via Razorpay)
   Buyer ──POST /escrow/pay (escrowId + razorpayPaymentId)──► Node Backend
          Node ──POST /initiate-payment/{id}──► Python (2s simulated delay, status: LOCKED)
          Node creates SHA-256 hash of escrow state snapshot
          Node ──recordEscrow()──► EscrowRegistry.sol (Sepolia)
          Node ──recordTransaction()──► TransactionLedger.sol (Sepolia)
          PostgreSQL updated (status: LOCKED_ON_CHAIN, blockchain_deal_id stored)

3. COMPLETION (Buyer confirms delivery)
   Buyer ──POST /escrow/complete (escrowId)──► Node Backend
          Node ──confirm-delivery/{id}──► Python (status: EXECUTED)
          Node ──disburse-funds/{id}──► Python (status: COMPLETED, funds released)
          Node ──recordTransaction()──► TransactionLedger.sol (settlement proof)
          Node ──completeEscrow(dealId, "COMPLETED")──► EscrowRegistry.sol
          PostgreSQL updated (status: COMPLETED, blockchain_tx = payment proof hash)
```

**Analytics computed from escrow data:**
- `totalTransactions` — total deals initiated
- `totalVolume` — sum of all deal amounts
- `completionRate` — % of deals completed
- `overdueCount` — deals past deadline that aren't completed
- `activeCount` — currently open deals

---

## Security Model

### Custodial Wallet Architecture

Users **do not manage crypto wallets** directly. When blockchain is enabled for an account:

1. `WalletService` generates a new Ethereum wallet (`ethers.Wallet.createRandom()`)
2. Private key is **AES-encrypted** using `ENCRYPTION_KEY` from `.env`
3. Encrypted key is stored in the `users` table
4. All blockchain transactions are **signed server-side** by the server wallet

**Benefits:**
- ✅ Better UX — no MetaMask or crypto knowledge required
- ✅ Enterprise-grade custodial pattern
- ✅ Users still have unique on-chain identities via their wallet address

### Payment Integrity

- All Razorpay payments are verified using **HMAC-SHA256 signature validation** before processing
- Payment metadata is hashed with **SHA-256** before storing on blockchain
- Blockchain records are **immutable** — cannot be altered after anchoring to Sepolia
- `metadataHash` allows anyone to verify the on-chain record matches the off-chain data

### Authentication

- Passwords stored as **SHA-256 hashes** in the database
- Sessions managed via **JWT tokens** (1-day expiry, signed with `JWT_SECRET`)
- Tokens stored in browser `localStorage` and attached to requests

---

## Setup & Installation

### Prerequisites

- **Node.js** ≥ 18.x
- **Python** ≥ 3.10
- **PostgreSQL** ≥ 14
- **Git**
- An **Alchemy** (or Infura) API key for Sepolia RPC
- A **Razorpay** account (test mode is fine)

### 1. Clone the Repository

```bash
git clone <repo-url>
cd "Major Project"
```

### 2. Set Up PostgreSQL Database

```sql
CREATE DATABASE smb_one_db;
```

Then create the required tables (users, payments, escrow_contracts, network_connections) using your preferred migration approach.

### 3. Configure Environment Variables

Copy and fill in the `.env` files as described in the [Environment Variables](#environment-variables) section.

### 4. Start the Escrow Payment Server

```bash
cd escrow-payment-server
python -m venv .venv
.venv\Scripts\activate           # Windows
# source .venv/bin/activate      # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8081
```

### 5. Start the OpsHub Backend

```bash
cd OpsHub-backend
npm install
node src/server.js
# or for development with auto-reload:
npx nodemon src/server.js
```

### 6. Start the OpsHub Frontend

```bash
cd OpsHub-frontend
npm install
npm run dev
# Open http://localhost:5173
```

### 7. (Optional) Deploy Smart Contracts

> The contracts are already deployed on Sepolia. Only run this if you need to redeploy.

```bash
cd OpsHub-web3
npm install
npx hardhat ignition deploy
# Update contract addresses in OpsHub-backend/.env after deployment
```

---

## Environment Variables

### `OpsHub-backend/.env`

```env
# Blockchain — Sepolia RPC endpoint
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<YOUR_ALCHEMY_API_KEY>

# Server wallet that signs all blockchain transactions
SERVER_PRIVATE_KEY=<your_server_wallet_private_key>

# Deployed contract addresses on Sepolia
CONTRACT_ADDRESS=<BusinessRegistry contract address>
TX_CONTRACT=<TransactionLedger contract address>
ESCROW_CONTRACT=<EscrowRegistry contract address>

# AES encryption key for storing wallet private keys in the DB
ENCRYPTION_KEY=<a_random_secret_string>

# PostgreSQL connection
DB_USER=postgres
DB_HOST=localhost
DB_NAME=smb_one_db
DB_PASSWORD=<your_postgres_password>

# JWT signing secret
JWT_SECRET=<a_random_secret_string>

# Razorpay credentials
RAZORPAY_KEY_ID=<your_razorpay_key_id>
RAZORPAY_KEY_SECRET=<your_razorpay_key_secret>

# Python escrow server URL
ESCROW_SERVER=http://localhost:8081
```

### `OpsHub-web3/.env`

```env
# Sepolia RPC for contract deployment
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<YOUR_ALCHEMY_API_KEY>

# Deployer wallet private key (must have Sepolia ETH for gas)
PRIVATE_KEY=<your_deployer_wallet_private_key>
```

> ⚠️ **Never commit `.env` files to version control.** All sensitive `.env` files are listed in `.gitignore`.

---

## Future Enhancements

- 📡 **Blockchain event listeners** — Real-time on-chain event streaming to the dashboard via WebSockets
- 🔍 **Admin audit dashboard** — Super-admin view of all on-chain transactions across all businesses
- 📄 **Document hash verification** — Attach SHA-256 hashes of legal/invoice documents to escrow deals
- 🔑 **Role-based access control** — Admin, business owner, accountant, and viewer roles
- 🔔 **Escrow webhook sync** — Push notifications when escrow status changes on either party's side
- 🪙 **Multi-currency support** — USD / EUR support via stablecoins on-chain
- 🏦 **Non-custodial option** — Allow technically-savvy users to connect their own MetaMask wallet
- 🤖 **AI-powered fraud detection** — Flag suspicious transaction patterns using ML

---

## Project Info

This project was built as a **college major project** demonstrating:

- **Full-stack web development** (React + Vite, Node.js + Express, PostgreSQL)
- **Blockchain integration** (Solidity, Hardhat, Ethers.js, Ethereum Sepolia testnet)
- **Microservice architecture** (Node.js REST API + Python FastAPI escrow service)
- **Payment gateway integration** (Razorpay INR payments with HMAC signature verification)
- **Enterprise blockchain patterns** (hybrid off-chain/on-chain storage, custodial wallets, hash-based data integrity)

---

*Built with ❤️ as a Major Project — 2026*
