# Test Documents for Trading Company Workflow

## Overview
This folder contains sample documents to test the complete trading company workflow. Upload them in the suggested order to see the intelligent workflow system in action.

## Test Scenario 1: Quotation → PO → Proforma → Invoice Flow

### Upload Order:
1. **quotation-abc-suppliers.pdf** - Initial price quotation from ABC Suppliers
2. **purchase-order-xyz-trading.pdf** - PO from XYZ Trading Company  
3. **proforma-invoice-abc-suppliers.pdf** - Proforma invoice issued after PO
4. **commercial-invoice-abc-suppliers.pdf** - Final commercial invoice
5. **packing-list-abc-suppliers.pdf** - Packing list for shipment

## Test Scenario 2: Proforma → PO → Invoice Flow

### Upload Order:
1. **proforma-invoice-def-suppliers.pdf** - Initial proforma invoice from DEF Suppliers
2. **purchase-order-xyz-trading-2.pdf** - PO from XYZ Trading Company
3. **tax-invoice-def-suppliers.pdf** - Final tax invoice
4. **packing-list-def-suppliers.pdf** - Packing list for shipment

## Expected Results

### After uploading each document, you should see:
- ✅ **Automatic Classification** - AI correctly identifies document type
- ✅ **Entity Extraction** - Supplier, trading company, customer details extracted
- ✅ **Workflow Progression** - Status advances automatically
- ✅ **Smart Suggestions** - AI suggests next steps
- ✅ **Document Linking** - Related documents grouped into transactions

### Go to http://localhost:3000/workflow to monitor progress!

## Entity Information in Test Documents

### Suppliers:
- **ABC Suppliers Ltd** (Test Scenario 1)
- **DEF Manufacturing Inc** (Test Scenario 2)

### Trading Company:
- **XYZ Trading Company Ltd** (Buyer in all scenarios)

### Customers:
- **Global Retail Corp** (End customer/consignee)
- **International Distributors** (Alternative customer)

## Test Document Contents

All test documents contain realistic content including:
- Company names and addresses
- Contact information  
- Product descriptions and pricing
- Payment terms and conditions
- Shipping details
- Invoice numbers and dates

Upload these documents through the web interface and watch the intelligent workflow system automatically:
1. Classify document types
2. Extract entity information
3. Link related documents
4. Suggest next workflow steps
5. Track transaction progress to completion
