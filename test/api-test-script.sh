#!/bin/bash

# API Testing Script for Trading Company Workflow
# Usage: chmod +x api-test-script.sh && ./api-test-script.sh

echo "🚀 Starting API Tests for Trading Company Workflow"
echo "=================================================="

BASE_URL="http://localhost:3001/api"

# Test 1: Health Check
echo "📍 Test 1: Health Check"
curl -s "$BASE_URL/health" | jq '.'
echo -e "\n"

# Test 2: Get Companies
echo "📍 Test 2: Get Companies (Rock Stone & Kinship)"
COMPANIES_RESPONSE=$(curl -s "$BASE_URL/quotation/companies")
echo $COMPANIES_RESPONSE | jq '.'
COMPANY_ID=$(echo $COMPANIES_RESPONSE | jq -r '.companies[0]._id')
echo "Using Company ID: $COMPANY_ID"
echo -e "\n"

# Test 3: Create a Customer
echo "📍 Test 3: Create Test Customer"
CUSTOMER_RESPONSE=$(curl -s -X POST "$BASE_URL/quotation/customers" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer Ltd",
    "address": "123 Business District, Dubai, UAE",
    "country": "UAE",
    "contact": "+971-4-123-4567",
    "email": "test@customer.ae",
    "currency": "AED"
  }')
echo $CUSTOMER_RESPONSE | jq '.'
CUSTOMER_ID=$(echo $CUSTOMER_RESPONSE | jq -r '.customer._id')
echo "Created Customer ID: $CUSTOMER_ID"
echo -e "\n"

# Test 4: Get Customers
echo "📍 Test 4: Get All Customers"
curl -s "$BASE_URL/quotation/customers" | jq '.'
echo -e "\n"

# Test 5: Upload Quotation (requires file)
echo "📍 Test 5: Upload Quotation File"
if [ -f "quotation-abc-suppliers-usd.txt" ]; then
  UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/quotation/upload" \
    -F "file=@quotation-abc-suppliers-usd.txt" \
    -F "orderReferenceNumber=TEST-API-001" \
    -F "companyId=$COMPANY_ID" \
    -F "customerId=$CUSTOMER_ID" \
    -F "shipmentMethod=sea" \
    -F "shippingTerms=CFR" \
    -F "portName=Hamburg Port" \
    -F "buyerOrderReference=TEST-PO-001")
  echo $UPLOAD_RESPONSE | jq '.'
  TRANSACTION_ID=$(echo $UPLOAD_RESPONSE | jq -r '.document.transactionId // empty')
  if [ ! -z "$TRANSACTION_ID" ]; then
    echo "Created Transaction ID: $TRANSACTION_ID"
  fi
else
  echo "❌ quotation-abc-suppliers-usd.txt not found in current directory"
  echo "Please run this script from the test/ directory"
fi
echo -e "\n"

# Test 6: Get Invoice Generation Banks
echo "📍 Test 6: Get Banks List for Invoice Generation"
curl -s "$BASE_URL/invoice-generation/banks" | jq '.'
echo -e "\n"

# Test 7: Get Collection Documents Banks
echo "📍 Test 7: Get Banks List for Collection Documents"
curl -s "$BASE_URL/collection-documents/banks" | jq '.'
echo -e "\n"

# Test 8: Generate PO and PFI (requires valid transaction)
if [ ! -z "$TRANSACTION_ID" ]; then
  echo "📍 Test 8: Generate PO and PFI"
  curl -s -X POST "$BASE_URL/po-generation/generate" \
    -H "Content-Type: application/json" \
    -d "{
      \"transactionId\": \"$TRANSACTION_ID\",
      \"shippingTerms\": \"CFR\",
      \"portName\": \"Hamburg Port\",
      \"buyerOrderReference\": \"TEST-PO-001\",
      \"shipmentMethod\": \"sea\"
    }" | jq '.'
else
  echo "📍 Test 8: Skipped - No valid transaction ID"
fi
echo -e "\n"

# Test 9: Get Available Items for Invoice (requires valid transaction)
if [ ! -z "$TRANSACTION_ID" ]; then
  echo "📍 Test 9: Get Available Items for Invoice"
  curl -s "$BASE_URL/invoice-generation/items/$TRANSACTION_ID" | jq '.'
else
  echo "📍 Test 9: Skipped - No valid transaction ID"
fi
echo -e "\n"

echo "✅ API Tests Completed!"
echo "================================"
echo "To run full workflow tests:"
echo "1. Ensure backend server is running (npm run dev)"
echo "2. Open browser to http://localhost:3000/quotation-upload"
echo "3. Follow the COMPLETE_TESTING_WORKFLOW.md guide"
echo "================================"
