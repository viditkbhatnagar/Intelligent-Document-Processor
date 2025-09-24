# Trading Company Workflow - Test Files & Guide

## 📁 **Test Files Created**

### **Quotation Documents**
1. **`quotation-abc-suppliers-usd.txt`** - USD quotation for steel pipes and fittings
2. **`quotation-euro-tech-eur.txt`** - EUR quotation for electronic components  
3. **`quotation-gulf-supplies-aed.txt`** - AED quotation for office furniture

### **Transport Documents**
1. **`bill-of-lading-sample.txt`** - For sea shipment testing
2. **`airway-bill-sample.txt`** - For air shipment testing
3. **`road-way-bill-sample.txt`** - For road shipment testing

### **Testing Resources**
1. **`COMPLETE_TESTING_WORKFLOW.md`** - Comprehensive step-by-step testing guide
2. **`api-test-script.sh`** - Automated API testing script
3. **`README.md`** - This overview file

---

## 🚀 **Quick Start Testing**

### **Option 1: Full UI Testing (Recommended)**
1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend  
   npm run dev
   ```

3. **Open Browser:**
   - Navigate to: `http://localhost:3000/quotation-upload`
   - Follow the **COMPLETE_TESTING_WORKFLOW.md** guide

### **Option 2: API Testing**
1. **Start Backend** (same as above)
2. **Run API Tests:**
   ```bash
   cd test
   ./api-test-script.sh
   ```

---

## 📋 **Testing Scenarios**

### **Scenario 1: Rock Stone + USD Steel Products**
- **Company:** Rock Stone  
- **Quotation:** `quotation-abc-suppliers-usd.txt`
- **Customer:** German Steel Works (create new)
- **Shipment:** Sea (BL)
- **Expected:** PO in USD, PFI in AED (rate: 3.68)

### **Scenario 2: Kinship + EUR Electronics**
- **Company:** Kinship
- **Quotation:** `quotation-euro-tech-eur.txt`  
- **Customer:** Dubai Electronics Hub (create new)
- **Shipment:** Air (AWB)
- **Expected:** PO in EUR, PFI in AED (rate: 4.55)

### **Scenario 3: Rock Stone + AED Furniture**
- **Company:** Rock Stone
- **Quotation:** `quotation-gulf-supplies-aed.txt`
- **Customer:** Abu Dhabi Office Solutions (create new)  
- **Shipment:** Road (RWB)
- **Expected:** Both PO and PFI in AED (no conversion)

---

## ✅ **Validation Checklist**

### **After Each Test:**
- [ ] Quotation processed correctly
- [ ] Supplier auto-created/found
- [ ] Customer management works
- [ ] Currency detection accurate
- [ ] Exchange rates applied correctly
- [ ] Payment terms auto-populated
- [ ] PO in supplier currency
- [ ] PFI in AED currency
- [ ] Invoice generation (full/partial)
- [ ] Collection documents with transport data
- [ ] Bank-specific templates
- [ ] Transaction status progression

---

## 🔧 **Troubleshooting**

### **Common Issues & Solutions:**
- **Backend won't start:** Check MongoDB connection
- **File upload fails:** Verify file format and size
- **Currency conversion wrong:** Check exchange rates (USD=3.68, EUR=4.55)
- **Documents not generating:** Verify all required fields filled

### **Debug Endpoints:**
- Health: `http://localhost:3001/api/health`
- Companies: `http://localhost:3001/api/quotation/companies`
- Banks: `http://localhost:3001/api/collection-documents/banks`

---

## 🎯 **Expected Workflow**

```
Quotation Upload
       ↓
   Process & Extract
       ↓
   Generate PO + PFI
       ↓
   Generate Invoice
       ↓
Collection Documents (Optional)
       ↓
    Complete ✅
```

---

## 📊 **Success Metrics**

A successful test demonstrates:
1. **Complete end-to-end workflow** execution
2. **Accurate currency handling** and conversions  
3. **Proper document generation** with correct data
4. **Purchase history** tracking and analytics
5. **Bank-specific templates** working correctly

---

## 🚨 **Important Notes**

- **Test files are realistic** business documents with proper structure
- **Multiple currencies** covered (USD, EUR, AED)
- **All shipment methods** tested (Sea, Air, Road)
- **Bank templates** for ADIB, DIB, BOK included
- **Partial/Full shipment** options available

---

**Ready to test the complete trading company workflow system!** 🎉
