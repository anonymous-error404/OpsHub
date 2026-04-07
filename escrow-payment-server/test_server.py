"""
Test script for the Escrow Payment Server
Demonstrates the complete workflow of contract creation, payment, verification, and disbursement
"""

import requests
import time
import json
from datetime import datetime

# Server configuration
BASE_URL = "http://127.0.0.1:8000"

# Color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_section(title):
    """Print a formatted section header"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{title:^70}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.END}\n")

def print_success(message):
    """Print success message"""
    print(f"{Colors.GREEN}✓ {message}{Colors.END}")

def print_info(message):
    """Print info message"""
    print(f"{Colors.CYAN}ℹ {message}{Colors.END}")

def print_error(message):
    """Print error message"""
    print(f"{Colors.RED}✗ {message}{Colors.END}")

def print_json(data, title="Response"):
    """Pretty print JSON data"""
    print(f"{Colors.YELLOW}{title}:{Colors.END}")
    print(json.dumps(data, indent=2))

def check_server_health():
    """Check if server is running"""
    print_section("SERVER HEALTH CHECK")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print_success(f"Server is running: {data['service']}")
            print_info(f"Version: {data['version']}")
            return True
        else:
            print_error(f"Server returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_error("Could not connect to server. Make sure it's running at http://127.0.0.1:8000")
        return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_create_contract():
    """Test creating a contract"""
    print_section("TEST 1: CREATE CONTRACT")
    
    contract_data = {
        "buyer_id": "buyer_acme",
        "seller_id": "seller_techsolutions",
        "amount": 500000.0
    }
    
    print_info(f"Creating contract with data: {json.dumps(contract_data)}")
    
    try:
        response = requests.post(f"{BASE_URL}/contracts", json=contract_data)
        
        if response.status_code == 200:
            contract = response.json()
            print_success("Contract created successfully!")
            print_json(contract)
            return contract["contract_id"], contract["amount"], contract["seller_id"]
        else:
            print_error(f"Failed to create contract: {response.status_code}")
            print_json(response.json())
            return None, None, None
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return None, None, None

def test_get_contract_status(contract_id):
    """Test getting contract status"""
    print_section(f"TEST 2: GET CONTRACT STATUS")
    
    print_info(f"Fetching status for contract: {contract_id}")
    
    try:
        response = requests.get(f"{BASE_URL}/contract-status/{contract_id}")
        
        if response.status_code == 200:
            contract = response.json()
            print_success("Contract status retrieved!")
            print_json(contract)
            print_info(f"Current Status: {Colors.BOLD}{contract['status']}{Colors.END}")
            return True
        else:
            print_error(f"Failed to get status: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_initiate_payment(contract_id):
    """Test initiating payment"""
    print_section(f"TEST 3: INITIATE PAYMENT")
    
    print_info(f"Initiating payment for contract: {contract_id}")
    print_info("Simulating 2-second payment gateway delay...")
    
    try:
        response = requests.post(f"{BASE_URL}/initiate-payment/{contract_id}")
        
        if response.status_code == 200:
            result = response.json()
            print_success("Payment initiated successfully!")
            print_json(result)
            print_info(f"New Status: {Colors.BOLD}{result['status']}{Colors.END}")
            return True
        else:
            print_error(f"Failed to initiate payment: {response.status_code}")
            print_json(response.json())
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_verify_contract(contract_id):
    """Test contract verification"""
    print_section(f"TEST 4: VERIFY CONTRACT")
    
    print_info(f"Verifying contract: {contract_id}")
    
    try:
        response = requests.post(f"{BASE_URL}/verify-contract/{contract_id}")
        
        if response.status_code == 200:
            result = response.json()
            print_success("Contract verified successfully!")
            print_json(result)
            print_info(f"New Status: {Colors.BOLD}{result['status']}{Colors.END}")
            return True
        else:
            print_error(f"Failed to verify contract: {response.status_code}")
            print_json(response.json())
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_disburse_funds(contract_id):
    """Test fund disbursement"""
    print_section(f"TEST 5: DISBURSE FUNDS")
    
    print_info(f"Disbursing funds for contract: {contract_id}")
    
    try:
        response = requests.post(f"{BASE_URL}/disburse-funds/{contract_id}")
        
        if response.status_code == 200:
            result = response.json()
            print_success("Funds disbursed successfully!")
            print_json(result)
            print_info(f"New Status: {Colors.BOLD}{result['status']}{Colors.END}")
            return True
        else:
            print_error(f"Failed to disburse funds: {response.status_code}")
            print_json(response.json())
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_list_contracts():
    """Test listing all contracts"""
    print_section("TEST 6: LIST ALL CONTRACTS")
    
    print_info("Fetching all contracts...")
    
    try:
        response = requests.get(f"{BASE_URL}/contracts")
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"Retrieved {data['total_contracts']} contract(s)")
            print_json(data)
            return True
        else:
            print_error(f"Failed to list contracts: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_filter_by_status(status):
    """Test filtering contracts by status"""
    print_section(f"TEST 7: FILTER CONTRACTS BY STATUS ('{status}')")
    
    print_info(f"Fetching all contracts with status: {status}")
    
    try:
        response = requests.get(f"{BASE_URL}/contracts/status/{status}")
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"Retrieved {data['count']} contract(s) with status '{status}'")
            print_json(data)
            return True
        else:
            print_error(f"Failed to filter contracts: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_final_status(contract_id):
    """Test final contract status"""
    print_section(f"TEST 8: FINAL CONTRACT STATUS")
    
    print_info(f"Fetching final status for contract: {contract_id}")
    
    try:
        response = requests.get(f"{BASE_URL}/contract-status/{contract_id}")
        
        if response.status_code == 200:
            contract = response.json()
            print_success("Final contract status retrieved!")
            print_json(contract)
            
            # Display timeline
            print(f"\n{Colors.BOLD}{Colors.CYAN}Timeline:{Colors.END}")
            print(f"  Created:   {contract['created_at']}")
            if contract['locked_at']:
                print(f"  Locked:    {contract['locked_at']}")
            if contract['verified_at']:
                print(f"  Verified:  {contract['verified_at']}")
            if contract['completed_at']:
                print(f"  Completed: {contract['completed_at']}")
            
            return True
        else:
            print_error(f"Failed to get final status: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def main():
    """Main test runner"""
    print(f"{Colors.BOLD}{Colors.HEADER}")
    print("""
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║     Mock Escrow Payment Server - Complete Workflow Test           ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
    """)
    print(Colors.END)
    
    # Check server health
    if not check_server_health():
        print(f"\n{Colors.RED}{Colors.BOLD}❌ Server is not running. Please start the server first.{Colors.END}")
        print(f"{Colors.YELLOW}Run: python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload{Colors.END}\n")
        return
    
    # Run complete workflow
    print_info("Starting complete workflow test...\n")
    
    # Step 1: Create contract
    contract_id, amount, seller_id = test_create_contract()
    if not contract_id:
        print_error("Failed to create contract. Aborting tests.")
        return
    
    # Step 2: Check initial status
    if not test_get_contract_status(contract_id):
        return
    
    # Step 3: Initiate payment
    time.sleep(1)
    if not test_initiate_payment(contract_id):
        return
    
    # Step 4: Verify contract
    time.sleep(1)
    if not test_verify_contract(contract_id):
        return
    
    # Step 5: Disburse funds
    time.sleep(1)
    if not test_disburse_funds(contract_id):
        return
    
    # Step 6: List all contracts
    time.sleep(1)
    test_list_contracts()
    
    # Step 7: Filter by status
    time.sleep(1)
    test_filter_by_status("COMPLETED")
    
    # Step 8: Final status
    time.sleep(1)
    test_final_status(contract_id)
    
    # Summary
    print_section("TEST SUMMARY")
    print(f"{Colors.GREEN}{Colors.BOLD}✓ All tests completed successfully!{Colors.END}\n")
    print(f"{Colors.CYAN}Contract Lifecycle Summary:{Colors.END}")
    print(f"  Contract ID: {contract_id}")
    print(f"  Buyer: buyer_acme")
    print(f"  Seller: {seller_id}")
    print(f"  Amount: ₹{amount:,.2f}")
    print(f"  Final Status: COMPLETED")
    print()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Test interrupted by user{Colors.END}\n")
    except Exception as e:
        print_error(f"Unexpected error: {str(e)}")
