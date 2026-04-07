"""
Mock Escrow Payment Server using FastAPI
Handles contract creation, payment initiation, verification, and fund disbursement
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from enum import Enum
from typing import Optional
import uuid
import asyncio
import logging
from datetime import datetime
import os
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================================
# ENUMS & CONSTANTS
# ============================================================================

class ContractStatus(str, Enum):
    """Contract status lifecycle"""
    CREATED = "CREATED"
    LOCKED = "LOCKED"
    EXECUTED = "EXECUTED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class CreateContractRequest(BaseModel):
    """Request model for creating a new contract"""
    buyer_id: str
    seller_id: str
    amount: float
    
    class Config:
        json_schema_extra = {
            "example": {
                "buyer_id": "buyer_123",
                "seller_id": "seller_456",
                "amount": 50000.0
            }
        }


class ContractResponse(BaseModel):
    """Response model for contract creation"""
    contract_id: str
    buyer_id: str
    seller_id: str
    amount: float
    status: ContractStatus
    created_at: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "contract_id": "contract_abc123",
                "buyer_id": "buyer_123",
                "seller_id": "seller_456",
                "amount": 50000.0,
                "status": "CREATED",
                "created_at": "2026-04-05T10:30:00"
            }
        }


class ContractStatusResponse(BaseModel):
    """Response model for contract status"""
    contract_id: str
    buyer_id: str
    seller_id: str
    amount: float
    status: ContractStatus
    created_at: str
    locked_at: Optional[str] = None
    verified_at: Optional[str] = None
    completed_at: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "contract_id": "contract_abc123",
                "buyer_id": "buyer_123",
                "seller_id": "seller_456",
                "amount": 50000.0,
                "status": "LOCKED",
                "created_at": "2026-04-05T10:30:00",
                "locked_at": "2026-04-05T10:35:00"
            }
        }


class MessageResponse(BaseModel):
    """Generic message response"""
    message: str
    contract_id: Optional[str] = None
    status: Optional[ContractStatus] = None


# ============================================================================
# INTERNAL DATA MODEL
# ============================================================================

class ContractData:
    """Internal contract data structure"""
    def __init__(self, contract_id: str, buyer_id: str, seller_id: str, amount: float):
        self.contract_id = contract_id
        self.buyer_id = buyer_id
        self.seller_id = seller_id
        self.amount = amount
        self.status = ContractStatus.CREATED
        self.created_at = datetime.now().isoformat()
        self.locked_at: Optional[str] = None
        self.verified_at: Optional[str] = None
        self.completed_at: Optional[str] = None


# ============================================================================
# FASTAPI APPLICATION
# ============================================================================

app = FastAPI(
    title="Mock Escrow Payment Server",
    description="A dynamic middleware for managing virtual INR escrow payments",
    version="1.0.0"
)

# Configure CORS to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files to serve SVG logos and other assets from the ui directory
ui_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ui")
app.mount("/static", StaticFiles(directory=ui_dir), name="static")

# In-memory contract storage
contracts_db: dict[str, ContractData] = {}


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def load_dummy_contracts():
    """Load dummy contracts from JSON file for demonstration"""
    try:
        json_file = os.path.join(os.path.dirname(__file__), "contracts_data.json")
        if os.path.exists(json_file):
            with open(json_file, 'r') as f:
                data = json.load(f)
                for contract_data in data.get('dummy_contracts', []):
                    contract = ContractData(
                        contract_id=contract_data['contract_id'],
                        buyer_id=contract_data['buyer_id'],
                        seller_id=contract_data['seller_id'],
                        amount=contract_data['amount']
                    )
                    contract.status = ContractStatus(contract_data['status'])
                    contract.created_at = contract_data['created_at']
                    contract.locked_at = contract_data.get('locked_at')
                    contract.verified_at = contract_data.get('verified_at')
                    contract.completed_at = contract_data.get('completed_at')
                    contracts_db[contract.contract_id] = contract
                logger.info(f"✓ Loaded {len(contracts_db)} dummy contracts from contracts_data.json")
        else:
            logger.info("ℹ No contracts_data.json file found, starting with empty database")
    except Exception as e:
        logger.warning(f"⚠ Failed to load dummy contracts: {str(e)}. Continuing with empty database.")


# Load dummy contracts on startup
load_dummy_contracts()


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def get_contract_or_404(contract_id: str) -> ContractData:
    """Retrieve contract or raise 404 error"""
    if contract_id not in contracts_db:
        raise HTTPException(
            status_code=404,
            detail=f"Contract with ID '{contract_id}' not found"
        )
    return contracts_db[contract_id]


def format_currency(amount: float) -> str:
    """Format amount as Indian Rupees"""
    return f"₹{amount:,.2f}"


def save_contracts_to_json():
    """Save all contracts in memory to JSON file for persistence"""
    try:
        json_file = os.path.join(os.path.dirname(__file__), "contracts_data.json")
        contracts_data = {
            "dummy_contracts": [
                {
                    "contract_id": contract.contract_id,
                    "buyer_id": contract.buyer_id,
                    "seller_id": contract.seller_id,
                    "amount": contract.amount,
                    "status": contract.status.value,
                    "created_at": contract.created_at,
                    "locked_at": contract.locked_at,
                    "verified_at": contract.verified_at,
                    "completed_at": contract.completed_at
                }
                for contract in contracts_db.values()
            ]
        }
        with open(json_file, 'w') as f:
            json.dump(contracts_data, f, indent=2)
        logger.info("✓ Contracts saved to contracts_data.json")
    except Exception as e:
        logger.warning(f"⚠ Failed to save contracts to JSON: {str(e)}")


# ============================================================================
# ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "running",
        "service": "Mock Escrow Payment Server",
        "version": "1.0.0"
    }


@app.get("/buyer")
def serve_buyer():
    """Serve the buyer UI"""
    buyer_path = os.path.join(os.path.dirname(__file__), "ui", "buyer.html")
    if os.path.exists(buyer_path):
        return FileResponse(buyer_path)
    return {"error": "Buyer UI file not found"}


@app.get("/seller")
def serve_seller():
    """Serve the seller UI"""
    seller_path = os.path.join(os.path.dirname(__file__), "ui", "seller.html")
    if os.path.exists(seller_path):
        return FileResponse(seller_path)
    return {"error": "Seller UI file not found"}


@app.post("/contracts", response_model=ContractResponse)
async def create_contract(request: CreateContractRequest):
    """
    Create a new contract
    
    - **buyer_id**: Unique identifier for the buyer
    - **seller_id**: Unique identifier for the seller
    - **amount**: Contract amount in INR
    
    Returns: Contract details with unique contract_id and CREATED status
    """
    # Generate unique contract ID
    contract_id = f"contract_{uuid.uuid4().hex[:12]}"
    
    # Create contract
    contract = ContractData(
        contract_id=contract_id,
        buyer_id=request.buyer_id,
        seller_id=request.seller_id,
        amount=request.amount
    )
    
    # Store in database
    contracts_db[contract_id] = contract
    
    logger.info(f"Contract created: {contract_id} | Buyer: {request.buyer_id} | "
                f"Seller: {request.seller_id} | Amount: {format_currency(request.amount)}")
    
    return ContractResponse(
        contract_id=contract.contract_id,
        buyer_id=contract.buyer_id,
        seller_id=contract.seller_id,
        amount=contract.amount,
        status=contract.status,
        created_at=contract.created_at
    )


@app.post("/initiate-payment/{contract_id}", response_model=MessageResponse)
async def initiate_payment(contract_id: str):
    """
    Initiate payment for a contract
    
    - **contract_id**: The ID of the contract to initiate payment for
    
    Logic:
    1. Lookup the specific amount tied to this contract_id
    2. Simulate a 2-second payment gateway response delay
    3. Update status to LOCKED
    4. Print console alert with payment confirmation
    
    Returns: Confirmation message with new status
    """
    # Validate contract exists
    contract = get_contract_or_404(contract_id)
    
    # Check if contract is in valid state (CREATED)
    if contract.status != ContractStatus.CREATED:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot initiate payment for contract in '{contract.status}' status. "
                   f"Expected 'CREATED' status."
        )
    
    # Simulate payment gateway delay
    logger.info(f"Processing payment for {contract_id}... (simulating 2s gateway delay)")
    await asyncio.sleep(2)
    
    # Update contract status
    contract.status = ContractStatus.LOCKED
    contract.locked_at = datetime.now().isoformat()
    
    # Save changes to JSON file
    save_contracts_to_json()
    
    # Console alert
    alert_message = f"🔒 Payment of {format_currency(contract.amount)} received and secured in Escrow."
    print(alert_message)
    logger.info(f"Contract {contract_id}: {alert_message}")
    
    return MessageResponse(
        message=alert_message,
        contract_id=contract_id,
        status=contract.status
    )


@app.post("/verify-contract/{contract_id}", response_model=MessageResponse)
async def verify_contract(contract_id: str):
    """
    Verify contract completion (AI/ML or manual verification)
    
    - **contract_id**: The ID of the contract to verify
    
    Logic:
    1. Update status from LOCKED to EXECUTED
    2. This represents successful completion of work
    
    Returns: Verification confirmation message
    """
    # Validate contract exists
    contract = get_contract_or_404(contract_id)
    
    # Check if contract is in valid state (LOCKED)
    if contract.status != ContractStatus.LOCKED:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot verify contract in '{contract.status}' status. "
                   f"Expected 'LOCKED' status (payment must be initiated first)."
        )
    
    # Update contract status
    contract.status = ContractStatus.EXECUTED
    contract.verified_at = datetime.now().isoformat()
    
    # Verification alert
    alert_message = f"✅ Contract {contract_id} verified. Work completed and approved."
    logger.info(alert_message)
    print(alert_message)
    
    return MessageResponse(
        message=alert_message,
        contract_id=contract_id,
        status=contract.status
    )


@app.post("/confirm-delivery/{contract_id}", response_model=MessageResponse)
async def confirm_delivery(contract_id: str):
    """
    Buyer confirms delivery of goods/services
    
    - **contract_id**: The ID of the contract
    
    Logic:
    1. Update status from LOCKED to EXECUTED
    2. Release funds from escrow
    
    Returns: Delivery confirmation message
    """
    # Validate contract exists
    contract = get_contract_or_404(contract_id)
    
    # Check if contract is in valid state (LOCKED - payment received)
    if contract.status != ContractStatus.LOCKED:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot confirm delivery for contract in '{contract.status}' status. "
                   f"Expected 'LOCKED' status (payment must be received first)."
        )
    
    # Update contract status to EXECUTED
    contract.status = ContractStatus.EXECUTED
    contract.verified_at = datetime.now().isoformat()
    
    # Save changes to JSON file
    save_contracts_to_json()
    
    # Delivery confirmation alert
    alert_message = f"✅ Delivery confirmed! Funds released from escrow to seller."
    logger.info(f"Contract {contract_id}: {alert_message}")
    print(alert_message)
    
    return MessageResponse(
        message=alert_message,
        contract_id=contract_id,
        status=contract.status
    )


@app.post("/disburse-funds/{contract_id}", response_model=MessageResponse)
async def disburse_funds(contract_id: str):
    """
    Disburse funds to seller
    
    - **contract_id**: The ID of the contract to disburse funds for
    
    Logic:
    1. Validate contract status is EXECUTED
    2. Fetch the exact amount and seller_id from contract data
    3. Print settlement completion alert
    4. Update status to COMPLETED
    
    Returns: Disbursement confirmation message
    """
    # Validate contract exists
    contract = get_contract_or_404(contract_id)
    
    # Check if contract is in valid state (EXECUTED)
    if contract.status != ContractStatus.EXECUTED:
        raise HTTPException(
            status_code=400,
            detail=f"❌ Contract conditions not yet met. Current status: '{contract.status}'. "
                   f"Expected 'EXECUTED' status."
        )
    
    # Fetch amount and seller_id from contract (never passed in endpoint call)
    amount = contract.amount
    seller_id = contract.seller_id
    
    # Disbursement alert
    alert_message = f"💸 Transferring {format_currency(amount)} to {seller_id}. Settlement Complete."
    print(alert_message)
    logger.info(alert_message)
    
    # Update contract status
    contract.status = ContractStatus.COMPLETED
    contract.completed_at = datetime.now().isoformat()
    
    # Save changes to JSON file
    save_contracts_to_json()
    
    return MessageResponse(
        message=alert_message,
        contract_id=contract_id,
        status=contract.status
    )


@app.get("/contract-status/{contract_id}", response_model=ContractStatusResponse)
async def get_contract_status(contract_id: str):
    """
    Get the current status and details of a contract
    
    - **contract_id**: The ID of the contract to check
    
    Returns: Complete contract details including all timestamps for timeline visualization
    
    Timeline progression:
    - CREATED: Contract initialized
    - LOCKED: Payment secured in escrow
    - EXECUTED: Work verified and approved
    - COMPLETED: Funds disbursed to seller
    """
    contract = get_contract_or_404(contract_id)
    
    return ContractStatusResponse(
        contract_id=contract.contract_id,
        buyer_id=contract.buyer_id,
        seller_id=contract.seller_id,
        amount=contract.amount,
        status=contract.status,
        created_at=contract.created_at,
        locked_at=contract.locked_at,
        verified_at=contract.verified_at,
        completed_at=contract.completed_at
    )


@app.get("/contracts")
async def list_contracts():
    """
    List all contracts
    
    Returns: Dictionary of all contracts with their current status
    """
    return {
        "total_contracts": len(contracts_db),
        "contracts": [
            {
                "contract_id": c.contract_id,
                "buyer_id": c.buyer_id,
                "seller_id": c.seller_id,
                "amount": c.amount,
                "status": c.status
            }
            for c in contracts_db.values()
        ]
    }


@app.get("/contracts/status/{status}")
async def get_contracts_by_status(status: ContractStatus):
    """
    Get all contracts with a specific status
    
    - **status**: Filter contracts by this status
    
    Returns: List of contracts matching the specified status
    """
    matching_contracts = [
        {
            "contract_id": c.contract_id,
            "buyer_id": c.buyer_id,
            "seller_id": c.seller_id,
            "amount": c.amount,
            "status": c.status
        }
        for c in contracts_db.values()
        if c.status == status
    ]
    
    return {
        "status": status,
        "count": len(matching_contracts),
        "contracts": matching_contracts
    }


@app.post("/contracts/{contract_id}/cancel", response_model=MessageResponse)
async def cancel_contract(contract_id: str):
    """
    Cancel a contract (only if in CREATED or LOCKED status)
    
    - **contract_id**: The ID of the contract to cancel
    
    Returns: Cancellation confirmation
    """
    contract = get_contract_or_404(contract_id)
    
    # Can only cancel if not already verified or completed
    if contract.status in [ContractStatus.EXECUTED, ContractStatus.COMPLETED]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel contract in '{contract.status}' status."
        )
    
    contract.status = ContractStatus.CANCELLED
    
    message = f"Contract {contract_id} has been cancelled."
    logger.info(message)
    
    return MessageResponse(
        message=message,
        contract_id=contract_id,
        status=contract.status
    )


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )
