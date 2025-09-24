# Complete Testing Workflow Guide

This guide provides step-by-step instructions to test the complete trading company workflow system.

## 🚀 **Setup & Prerequisites**

### 1. Start the Backend Server
```bash
cd backend
npm run dev
```
Server should start on `http://localhost:3001`

### 2. Start the Frontend Application
```bash
cd frontend
npm run dev
```
Frontend should start on `http://localhost:3000`

### 3. Verify System Health
- Visit: `http://localhost:3001/api/health`
- Should return: `{"status":"ok",...}`

---

## 📋 **Complete Workflow Testing**

### **SCENARIO 1: USD Quotation → Full Workflow (Rock Stone)**

#### **Step 1: Upload Quotation**
1. Go to: `http://localhost:3000/quotation-upload`
2. Fill out the form:
   - **File**: Upload `quotation-abc-suppliers-usd.txt`
   - **Order Reference Number**: `ORD-RS-2024-001`
   - **Company**: Select "Rock Stone (RS)"
   - **End Customer**: Click "+ New" and create:
     - Name: `German Steel Works`
     - Address: `Hamburg Industrial Zone, Germany`
     - Country: `Germany`
     - Contact: `+49-40-555-1234`
     - Email: `orders@germansteel.de`
   - **Shipment Method**: `Sea`
   - **Shipping Terms**: `CFR`
   - **Port Name**: `Hamburg Port`
   - **Buyer Order Reference**: `GSW-PO-2024-456`

3. Click "Upload Quotation & Start Workflow"
4. Wait for processing and note the document ID

#### **Step 2: Generate PO and PFI**
1. Navigate to the processing page (should redirect automatically)
2. Look for "Generate PO & PFI" option
3. Verify generated documents:
   - **PO**: Should be in USD (supplier currency)
   - **PFI**: Should be in AED (converted at 3.68 rate)
   - **Payment Terms**: Should show "180 DAYS FROM BL"

#### **Step 3: Generate Invoice**
1. After PO/PFI generation, look for "Generate Invoice" option
2. Choose "Full Shipment"
3. Select Bank: `ADIB - Abu Dhabi Islamic Bank`
4. Generate invoice (should be in AED)

#### **Step 4: Generate Collection Documents**
1. After invoice generation, look for "Generate Collection Documents"
2. Upload transport document: `bill-of-lading-sample.txt`
3. Select Bank: `ADIB`
4. Generate covering letter and bill of exchange
5. Verify documents contain:
   - BL number: `MAEU123456789`
   - BL date: `25/12/2024`
   - Payment terms: `180 DAYS FROM BL`

---

### **SCENARIO 2: EUR Quotation → Partial Shipment (Kinship)**

#### **Step 1: Upload Quotation**
1. Go to: `http://localhost:3000/quotation-upload`
2. Fill out the form:
   - **File**: Upload `quotation-euro-tech-eur.txt`
   - **Order Reference Number**: `ORD-KS-2024-002`
   - **Company**: Select "Kinship (KS)"
   - **End Customer**: Click "+ New" and create:
     - Name: `Dubai Electronics Hub`
     - Address: `Dubai Silicon Oasis, Dubai, UAE`
     - Country: `UAE`
     - Contact: `+971-4-333-7890`
     - Email: `procurement@dubaielec.ae`
   - **Shipment Method**: `Air`
   - **Shipping Terms**: `CPT`
   - **Port Name**: `Dubai International Airport`
   - **Buyer Order Reference**: `DEH-2024-789`

3. Upload and process

#### **Step 2: Generate PO and PFI**
- **PO**: Should be in EUR
- **PFI**: Should be in AED (converted at 4.55 rate)
- **Payment Terms**: Should show "180 DAYS FROM AWB"

#### **Step 3: Generate Partial Invoice**
1. Choose "Partial Shipment"
2. Select only some items (e.g., 15 Industrial Controllers, 10 Frequency Converters)
3. Select Bank: `DIB - Dubai Islamic Bank`
4. Generate partial invoice

#### **Step 4: Generate Collection Documents**
1. Upload transport document: `airway-bill-sample.txt`
2. Select Bank: `DIB`
3. Generate documents with AWB details

---

### **SCENARIO 3: AED Quotation → Road Shipment (Rock Stone)**

#### **Step 1: Upload Quotation**
1. Upload `quotation-gulf-supplies-aed.txt`
2. Order Reference: `ORD-RS-2024-003`
3. Company: Rock Stone
4. Customer: Create "Abu Dhabi Office Solutions"
5. Shipment Method: `Road`
6. Shipping Terms: `DAP`
7. Port Name: `Abu Dhabi`

#### **Step 2: Complete Workflow**
- PO and PFI should both be in AED (no conversion)
- Payment terms: "180 DAYS FROM RWB"
- Upload `road-way-bill-sample.txt` for collection documents
- Select Bank: `BOK - Bank of Kuwait`

---

## 🧪 **API Testing with cURL**

### **Test Company Endpoints**
```bash
# Get companies
curl -X GET http://localhost:3001/api/quotation/companies

# Get customers
curl -X GET http://localhost:3001/api/quotation/customers

# Create customer
curl -X POST http://localhost:3001/api/quotation/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer Ltd",
    "address": "Test Address, Dubai",
    "country": "UAE",
    "contact": "+971-4-123-4567"
  }'
```

### **Test File Upload**
```bash
curl -X POST http://localhost:3001/api/quotation/upload \
  -F "file=@test/quotation-abc-suppliers-usd.txt" \
  -F "orderReferenceNumber=TEST-001" \
  -F "companyId=COMPANY_ID_HERE" \
  -F "customerId=CUSTOMER_ID_HERE" \
  -F "shipmentMethod=sea" \
  -F "shippingTerms=CFR" \
  -F "portName=Hamburg"
```

---

## ✅ **Expected Results & Validations**

### **After Quotation Upload:**
- Document status: "processed"
- Transaction created with status: "quotation_received"
- Supplier auto-created/found
- Currency detected correctly
- Purchase history record created

### **After PO/PFI Generation:**
- Transaction status: "po_issued"
- PO in supplier currency
- PFI in AED with correct conversion rates
- Payment terms auto-populated based on shipment method

### **After Invoice Generation:**
- Transaction status: "invoice_received"
- Invoice in AED
- Correct items and quantities
- Bank name included

### **After Collection Documents:**
- Transaction status: "completed"
- Covering letter with correct transport document details
- Bill of exchange with 180-day maturity
- Bank-specific templates used

---

## 🚨 **Testing Checklist**

### **Functional Testing:**
- [ ] Quotation upload and processing
- [ ] Company selection (Rock Stone/Kinship)
- [ ] Customer management (add new, select existing)
- [ ] Currency detection and conversion
- [ ] PO generation in supplier currency
- [ ] PFI generation in AED
- [ ] Payment terms auto-population
- [ ] Full shipment invoice generation
- [ ] Partial shipment with item selection
- [ ] Transport document upload and processing
- [ ] Bank selection and template generation
- [ ] Collection documents generation

### **Data Validation:**
- [ ] Purchase history tracking
- [ ] Supplier information storage
- [ ] Item price history
- [ ] Exchange rate calculations
- [ ] Transaction status progression
- [ ] Document relationships

### **Error Handling:**
- [ ] Invalid file formats
- [ ] Missing required fields
- [ ] Database connection issues
- [ ] File processing failures

---

## 📊 **Reporting & Analytics Testing**

### **Purchase History Queries:**
```bash
# Get item price history
curl -X GET "http://localhost:3001/api/supplier/items/SUPPLIER_ID/history?item=Steel Pipes"

# Get company transactions
curl -X GET "http://localhost:3001/api/reporting/company/RS/transactions"
```

### **Expected Reports:**
- Order reference tracking by company
- Item pricing trends over time
- Supplier performance metrics
- Currency conversion history

---

## 🔧 **Troubleshooting**

### **Common Issues:**
1. **Backend not starting**: Check MongoDB connection
2. **File upload fails**: Verify file size limits and formats
3. **Currency conversion wrong**: Check exchange rates in service
4. **Templates not generating**: Verify bank selection and data

### **Debug Endpoints:**
- Health check: `http://localhost:3001/api/health`
- Document status: `http://localhost:3001/api/documents/DOCUMENT_ID`
- Transaction details: `http://localhost:3001/api/workflow/TRANSACTION_ID`

---

## 🎯 **Success Criteria**

A successful test run should demonstrate:
1. **Complete workflow execution** from quotation to collection documents
2. **Accurate currency handling** and conversions
3. **Proper document generation** with correct data population
4. **Data persistence** and relationship tracking
5. **Bank-specific template** generation
6. **Purchase history** recording and analytics

---

This comprehensive testing workflow ensures all features work as designed and meets your trading company requirements!
