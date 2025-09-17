# 🚀 Intelligent Document Processor & Template Generator

An AI-powered document processing system designed for trading companies to automate document workflows, extract data, and generate banking templates like covering letters and bills of exchange.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Business Flow](#business-flow)
- [Technical Architecture](#technical-architecture)
- [Installation & Setup](#installation--setup)
- [How to Use](#how-to-use)
- [API Documentation](#api-documentation)
- [File Storage](#file-storage)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This application streamlines the entire trading document workflow from initial quotation to final template generation. It uses AI to:

- **Classify documents** automatically (quotations, POs, invoices, etc.)
- **Extract key data** from documents using OCR and AI
- **Link related documents** into business transactions
- **Track workflow progress** through intelligent status management
- **Generate banking templates** pre-filled with extracted data

### 💼 Perfect For:
- Trading companies
- Import/export businesses
- Financial institutions
- Document processing centers

---

## ✨ Key Features

### 🤖 AI-Powered Processing
- **Automatic document classification** using Anthropic Claude
- **Smart entity extraction** (supplier, buyer, consignee details)
- **Field extraction** with confidence scoring
- **Relationship mapping** between documents

### 📊 Intelligent Workflow Management
- **Real-time status tracking** across 6 workflow stages
- **Automatic document linking** based on business entities
- **Progress visualization** with actionable dashboards
- **Smart suggestions** for next steps

### 📄 Template Generation
- **Pre-filled covering letters** and bills of exchange
- **Multiple bank formats** (Bank 1, Bank 2, Bank 3)
- **Editable templates** before download
- **Data validation** and consistency checks

### 💾 Enterprise Storage
- **MongoDB GridFS** for secure file storage
- **Cloud-ready** with database clustering support
- **No local file storage** - everything in the database
- **Scalable architecture** for high volume processing

---

## 🔄 Business Flow

### Traditional Trading Process
Our system automates this complete trading workflow:

```
1. 📋 QUOTATION/PROFORMA INVOICE
   ↓ Supplier provides pricing
   
2. 🛒 PURCHASE ORDER (PO/LPO)
   ↓ Trading company confirms purchase
   
3. 📊 PROFORMA INVOICE (if quotation was initial)
   ↓ Supplier issues before order preparation
   
4. 💰 PAYMENT PROCESSING
   ↓ Trading company pays per PO terms
   
5. 📦 ORDER FULFILLMENT
   ↓ Supplier prepares goods for shipment
   
6. 📋 FINAL DOCUMENTATION
   ↓ Commercial/Tax Invoice + Packing List
   
7. 🏦 BANKING TEMPLATES
   ↓ Generate covering letter & bill of exchange
```

### Workflow States
The system tracks 6 main workflow states:

| State | Description | Required Documents |
|-------|-------------|-------------------|
| **quotation_received** | Initial pricing received | Quotation |
| **po_issued** | Purchase confirmed | PO + Quotation/Proforma |
| **proforma_received** | Final pricing confirmed | Proforma Invoice |
| **invoice_received** | Goods ready, invoice issued | Commercial/Tax Invoice |
| **completed** | All documents received | Invoice + Packing List |
| **templates_generated** | Banking docs created | All above + Templates |

---

## 🏗️ Technical Architecture

### Backend Stack
- **Node.js + TypeScript** for robust API development
- **Express.js** for REST API endpoints
- **MongoDB + GridFS** for document and file storage
- **Anthropic Claude AI** for document processing
- **Tesseract.js** for OCR capabilities
- **Multer** for file upload handling

### Frontend Stack
- **React 18 + TypeScript** for modern UI
- **TailwindCSS** for responsive design
- **React Router** for navigation
- **TanStack Query** for data management

### AI Integration
- **Document Classification**: Identifies document types automatically
- **Entity Extraction**: Extracts company details, amounts, dates
- **Field Recognition**: Structured data extraction with confidence scores
- **Relationship Mapping**: Links documents to business transactions

### Database Design
```
Documents Collection:
├── File metadata (name, size, type)
├── GridFS file reference
├── AI extraction results
├── Workflow transaction ID
└── Processing status

Business Transactions Collection:
├── Transaction workflow state
├── Linked document references
├── Extracted business entities
├── Progress tracking
└── Next action suggestions

GridFS Collections:
├── fs.files (file metadata)
└── fs.chunks (file binary data)
```

---

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** (local or MongoDB Atlas)
- **Anthropic API Key** ([Get from here](https://console.anthropic.com/))

### 1. Clone Repository
```bash
git clone <repository-url>
cd intelligent-document-processor
```

### 2. Environment Configuration
Create `.env` file in the root directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/intelligent-document-processor
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/intelligent-document-processor

# Server Configuration  
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# AI Configuration (REQUIRED)
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Enable AI processing
ENABLE_AI_PROCESSING=true

# JWT Secret (generate a secure random string)
JWT_SECRET=your_secure_jwt_secret_here

# File upload configuration (GridFS handles storage)
MAX_FILE_SIZE=50000000
```

### 3. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
cd ..
```

### 4. Start the Application
```bash
# Development mode (runs both frontend and backend)
npm run dev

# OR start separately:
# Backend: npm run dev:backend
# Frontend: npm run dev:frontend
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

---

## 🚀 How to Use

### Step 1: Upload Documents
1. Go to **Upload** tab
2. Upload documents **one by one** in business order:
   - Quotation (`1-quotation.txt`)
   - Purchase Order (`2-purchase-order.txt`)
   - Proforma Invoice (`3-proforma-invoice.txt`)
   - Commercial Invoice (`4-commercial-invoice.txt`)
   - Packing List (`5-packing-list.txt`)

### Step 2: Monitor Progress
1. Check **Workflow** tab to see:
   - Transaction progress
   - Document count (e.g., "5 uploaded")
   - Current status
   - Business entities extracted

### Step 3: Take Action
1. Go to **Take Action** tab
2. Find transactions with status "completed"
3. Click **Take Action** button
4. Select bank format (Bank 1, 2, or 3)
5. Review and edit template fields
6. Download generated templates

### Supported File Types
- **PDF** (`.pdf`)
- **Word Documents** (`.doc`, `.docx`)
- **Images** (`.jpg`, `.jpeg`, `.png`, `.tiff`)
- **Text Files** (`.txt`)

---

## 📡 API Documentation

### Core Endpoints

#### Document Management
```
POST   /api/documents/upload          # Upload document
GET    /api/documents                 # List user documents  
GET    /api/documents/:id             # Get specific document
DELETE /api/documents/:id             # Delete document
POST   /api/documents/:id/reprocess   # Reprocess document
```

#### Workflow Management
```
GET    /api/workflow/dashboard        # Get workflow summary
GET    /api/workflow/transactions     # List transactions
GET    /api/workflow/transactions/:id # Get specific transaction
PUT    /api/workflow/transactions/:id/status # Update status
```

#### Template Actions
```
POST   /api/workflow-actions/perform/:transactionId    # Advance workflow
GET    /api/workflow-actions/templates/:transactionId  # Generate templates
```

### Example API Usage

#### Upload Document
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/api/documents/upload', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log('Upload successful:', data));
```

#### Get Workflow Dashboard
```javascript
fetch('/api/workflow/dashboard')
.then(response => response.json())
.then(data => {
  console.log('Total transactions:', data.dashboard.summary.totalTransactions);
  console.log('Completed:', data.dashboard.summary.completedTransactions);
});
```

---

## 💾 File Storage

### GridFS Implementation
All files are stored in **MongoDB GridFS**, not locally:

#### Benefits:
- ✅ **Database clustering support** 
- ✅ **Automatic replication**
- ✅ **No local file system dependencies**
- ✅ **Scalable for large files (16MB+)**
- ✅ **Atomic operations** with transactions

#### Storage Structure:
```
GridFS Collections:
├── fs.files
│   ├── File metadata
│   ├── Upload date
│   ├── User information
│   └── MIME type
└── fs.chunks
    └── Binary file data (chunked)

Document Records:
├── fileId (GridFS reference)
├── Processing results
└── Workflow information
```

#### File Lifecycle:
1. **Upload** → Stored in GridFS + metadata in documents collection
2. **Processing** → Retrieved from GridFS for AI analysis
3. **Workflow** → File linked to business transactions
4. **Delete** → Removed from both GridFS and documents collection

---

## 🔧 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
```
Error: connect ECONNREFUSED ::1:27017
```
**Solution**: 
- Install MongoDB locally, OR
- Use MongoDB Atlas cloud database
- Update `MONGODB_URI` in `.env`

#### 2. AI Processing Errors
```
Error: Could not resolve authentication method
```
**Solution**:
- Get API key from [Anthropic Console](https://console.anthropic.com/)
- Add to `.env` as `ANTHROPIC_API_KEY=sk-ant-api03-...`
- Restart the backend

#### 3. File Upload Issues
```
Error: Unsupported file type
```
**Solution**:
- Use supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, TIFF
- Check file size (max 50MB)
- Ensure file is not corrupted

#### 4. Workflow Not Advancing
```
Documents uploaded but status stuck
```
**Solution**:
- Upload documents in correct order
- Wait for AI processing to complete
- Check backend logs for errors
- Verify all required documents uploaded

#### 5. Template Generation Failed
```
No actionable transactions
```
**Solution**:
- Ensure transaction status is "completed"
- All required documents must be uploaded:
  - Quotation/Proforma
  - Purchase Order  
  - Commercial Invoice
  - Packing List

### Debug Mode
Enable detailed logging by setting:
```env
NODE_ENV=development
```

### Health Checks
Monitor application health:
```bash
# Backend health
curl http://localhost:3001/api/health

# Database connection
curl http://localhost:3001/api/documents
```

---

## 📈 Performance & Scaling

### Production Considerations
- Use **MongoDB Atlas** for managed database
- Configure **GridFS sharding** for large file volumes
- Implement **Redis caching** for frequent queries
- Set up **load balancing** for multiple instances
- Monitor **AI API usage** and rate limits

### File Size Limits
- **Default**: 50MB per file
- **GridFS**: Supports files up to 4GB
- **Recommend**: < 10MB for optimal performance

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section above
- Review API documentation

---

**Built with ❤️ for modern trading workflows**
