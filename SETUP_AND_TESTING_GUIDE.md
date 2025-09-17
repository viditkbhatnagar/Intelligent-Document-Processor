# 🚀 Setup and Testing Guide

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** (local installation or MongoDB Atlas)
- **Anthropic API Key** (for AI processing)

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd /Users/viditkbhatnagar/codes/intelligent-document-processor

# Install all dependencies (root, backend, and frontend)
npm run setup
```

### 2. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your configuration
nano .env
```

**Required Environment Variables:**

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/intelligent-document-processor

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# AI Configuration (Get from https://console.anthropic.com/)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Enable AI processing
ENABLE_AI_PROCESSING=true

# JWT Secret (generate a secure random string)
JWT_SECRET=your_secure_jwt_secret_here

# File upload configuration
MAX_FILE_SIZE=50000000
UPLOAD_DIR=uploads
```

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

**Option B: MongoDB Atlas**
- Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com/)
- Get your connection string and update `MONGODB_URI` in `.env`

### 4. Build and Start the Application

```bash
# Build the backend
npm run build:backend

# Start both frontend and backend in development mode
npm run dev
```

**The application will be available at:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Workflow Dashboard**: http://localhost:3000/workflow

## 📋 Testing the Trading Company Workflow

### Test Documents Order

To properly test the intelligent workflow, upload documents in this specific order to see the complete business flow:

### **Scenario 1: Quotation → PO → Proforma Invoice Flow**

**Step 1: Upload Quotation Document**
- **Document Type**: Quotation from supplier
- **Expected AI Classification**: `quotation`
- **What Happens**: 
  - System creates new transaction
  - Extracts supplier and customer entities
  - Suggests: "Issue Purchase Order to confirm purchase from supplier"

**Step 2: Upload Purchase Order (PO)**
- **Document Type**: Purchase Order from trading company
- **Expected AI Classification**: `purchase_order`
- **What Happens**:
  - Links to existing transaction
  - Workflow advances to "po_issued" 
  - Suggests: "Wait for supplier to issue Proforma Invoice"

**Step 3: Upload Proforma Invoice**
- **Document Type**: Proforma Invoice from supplier (after PO)
- **Expected AI Classification**: `proforma_invoice`
- **What Happens**:
  - Links to existing transaction
  - Workflow advances to "proforma_received"
  - Suggests: "Make payment to supplier according to payment terms"

**Step 4: Upload Commercial Invoice**
- **Document Type**: Commercial/Tax Invoice from supplier
- **Expected AI Classification**: `commercial_invoice` or `tax_invoice`
- **What Happens**:
  - Links to existing transaction
  - Workflow advances to "invoice_received"
  - Suggests: "Upload packing list to complete transaction"

**Step 5: Upload Packing List**
- **Document Type**: Packing List from supplier
- **Expected AI Classification**: `packing_list`
- **What Happens**:
  - Links to existing transaction
  - Workflow completes → status becomes "completed"
  - Shows transaction summary

---

### **Scenario 2: Proforma Invoice → PO Flow** 

**Step 1: Upload Proforma Invoice First**
- **Document Type**: Proforma Invoice from supplier
- **Expected AI Classification**: `proforma_invoice`
- **What Happens**:
  - System creates new transaction
  - Suggests: "Issue Purchase Order to confirm purchase from supplier"

**Step 2: Upload Purchase Order**
- **Document Type**: Purchase Order from trading company
- **Expected AI Classification**: `purchase_order`
- **What Happens**:
  - Links to existing transaction
  - Workflow advances to "po_issued"
  - Suggests: "Make payment according to payment terms" (skips additional proforma step)

**Continue with Steps 4-5 from Scenario 1**

---

## 📄 Test Document Samples

### Create Test Documents

**1. Quotation Document (quotation.pdf)**
```
QUOTATION
From: ABC Suppliers Ltd
To: XYZ Trading Company
Date: [Current Date]

Items:
- Product A: $1,000
- Product B: $2,000
Total: $3,000

Validity: 30 days
Payment Terms: 50% advance, 50% on delivery
```

**2. Purchase Order (po.pdf)**
```
PURCHASE ORDER #PO-001
From: XYZ Trading Company
To: ABC Suppliers Ltd
Date: [Current Date]

Please supply:
- Product A: $1,000
- Product B: $2,000
Total: $3,000

Delivery Address: [Address]
Payment Terms: As per quotation
```

**3. Proforma Invoice (proforma.pdf)**
```
PROFORMA INVOICE #PI-001
From: ABC Suppliers Ltd
To: XYZ Trading Company
Date: [Current Date]

Invoice Amount: $3,000
Payment Terms: 50% advance
Bank Details: [Bank information]
```

**4. Commercial Invoice (invoice.pdf)**
```
COMMERCIAL INVOICE #INV-001
Seller: ABC Suppliers Ltd
Buyer: XYZ Trading Company
Consignee: Customer Corp (if different)
Date: [Current Date]

Items shipped:
- Product A: $1,000  
- Product B: $2,000
Total: $3,000
```

**5. Packing List (packing_list.pdf)**
```
PACKING LIST
Invoice #: INV-001
Date: [Current Date]

Contents:
- Box 1: Product A (1 unit)
- Box 2: Product B (1 unit)
Total Boxes: 2
Weight: 50kg
```

## 🔍 What to Watch For

### 1. Workflow Dashboard
- Visit http://localhost:3000/workflow
- Watch transaction status updates in real-time
- Monitor suggested actions and priority levels

### 2. Document Processing
- Upload each document and wait for processing
- Check AI classification accuracy
- Verify entity extraction (supplier, trading company, customer)

### 3. Intelligent Linking
- Ensure documents get linked to the same transaction
- Verify workflow progression follows business rules
- Check relationship mapping between entities

### 4. Smart Suggestions
- Review AI-generated next step recommendations
- Verify confidence scores for suggestions
- Test workflow advancement logic

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Failed**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
```

**2. AI Processing Not Working**
- Verify `ANTHROPIC_API_KEY` in `.env`
- Check `ENABLE_AI_PROCESSING=true`
- Monitor backend logs for API errors

**3. Documents Not Processing**
- Check file upload size limits
- Verify supported file formats (PDF, DOCX, images)
- Monitor backend logs during upload

**4. Workflow Not Advancing**
- Check entity extraction accuracy
- Verify document classification
- Review transaction linking logic

### Backend Logs
```bash
# View backend logs
cd backend && npm run dev
```

### Frontend Logs
```bash
# View frontend logs  
cd frontend && npm run dev
```

## 📊 Expected Results

After completing the test scenarios, you should see:

1. **Multiple Transactions** in the workflow dashboard
2. **Complete Entity Mapping** (supplier, trading company, customer)
3. **Workflow Progression** from quotation → completed
4. **Smart Suggestions** at each step
5. **Document Relationships** clearly linked
6. **Success Metrics** in the dashboard analytics

## 🎯 Success Criteria

✅ **Document Classification**: All documents classified correctly  
✅ **Entity Extraction**: Company information extracted accurately  
✅ **Workflow Progression**: Status advances automatically  
✅ **Document Linking**: Related documents grouped properly  
✅ **Smart Suggestions**: Relevant next steps recommended  
✅ **Dashboard Updates**: Real-time status updates  
✅ **Transaction Completion**: Full workflow from start to finish  

The system should intelligently handle the complete trading company business flow with minimal manual intervention!
