# 🚀 Single Command Setup

Your trading company workflow system is now configured to run with a single command!

## ⚡ **Quick Start (Development)**

### **1. Install Dependencies**
```bash
npm run setup
```
*This installs dependencies for root, backend, and frontend*

### **2. Start Development Server**
```bash
npm run dev
```
*This starts both backend (port 3001) and frontend (port 3000) simultaneously*

### **3. Access the Application**
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:3001/api`
- **Health Check**: `http://localhost:3001/api/health`

---

## 🏗️ **Production Build & Deploy**

### **1. Build Everything**
```bash
npm run build
```
*This builds frontend, copies it to backend, and builds backend*

### **2. Start Production Server**
```bash
npm start
```
*This runs only the backend server which serves both API and frontend*

### **3. Access Production**
- **Single URL**: `http://localhost:3001` (serves both frontend and API)

---

## 📋 **Available Commands**

### **Development Commands**
```bash
npm run dev              # Start both servers (recommended)
npm run dev:backend      # Start only backend
npm run dev:frontend     # Start only frontend
```

### **Build Commands**
```bash
npm run build           # Build everything for production
npm run build:backend   # Build only backend
npm run build:frontend  # Build only frontend
npm run copy-frontend   # Copy frontend build to backend
```

### **Utility Commands**
```bash
npm run setup          # Install all dependencies
npm run clean          # Remove all build files and node_modules
npm run test           # Run all tests
npm run lint           # Run all linting
```

---

## 🔧 **How It Works**

### **Development Mode** (`npm run dev`)
- **Frontend**: Runs on port 3000 with Vite dev server
- **Backend**: Runs on port 3001 with nodemon
- **API Proxy**: Frontend proxies `/api/*` calls to backend
- **Hot Reload**: Both frontend and backend support hot reloading

### **Production Mode** (`npm start`)
- **Single Server**: Backend serves both API and frontend
- **Static Files**: Frontend built files served from backend
- **Routing**: Backend handles SPA routing for React app
- **Environment**: `NODE_ENV=production`

---

## 🧪 **Testing Your Setup**

### **1. Test Development Mode**
```bash
npm run dev
```
*Visit `http://localhost:3000/quotation-upload`*

### **2. Test Production Mode**
```bash
npm run build
npm start
```
*Visit `http://localhost:3001/quotation-upload`*

### **3. Run API Tests**
```bash
cd test
./api-test-script.sh
```

---

## 📁 **File Structure**

```
intelligent-document-processor/
├── package.json          # Root commands (dev, build, start)
├── backend/
│   ├── src/              # TypeScript source
│   ├── dist/             # Compiled JavaScript
│   ├── frontend-build/   # Frontend static files (production)
│   └── package.json      # Backend dependencies
├── frontend/
│   ├── src/              # React source
│   ├── dist/             # Built frontend (copied to backend)
│   └── package.json      # Frontend dependencies
└── test/                 # Test files and scripts
```

---

## 🚨 **Important Notes**

### **Environment Variables**
- Create `.env` in the root directory
- Backend loads environment variables from root `.env`

### **Database**
- Make sure MongoDB is running
- Backend auto-initializes companies (Rock Stone, Kinship)
- Templates are auto-seeded on startup

### **CORS Configuration**
- Development: Frontend (3000) → Backend (3001)
- Production: Everything served from backend (3001)

---

## ✅ **Success Indicators**

### **Development Mode Working:**
- ✅ Both servers start without errors
- ✅ Frontend accessible at `localhost:3000`
- ✅ API calls work (check Network tab)
- ✅ Hot reload works for both frontend and backend

### **Production Mode Working:**
- ✅ Single server serves everything from `localhost:3001`
- ✅ React app loads correctly
- ✅ API calls work without CORS issues
- ✅ All routes work (including React Router)

---

## 🎯 **Ready to Test!**

Now you can:
1. **Run `npm run dev`** - Start development
2. **Visit `localhost:3000/quotation-upload`**
3. **Follow the complete testing workflow** in `/test/COMPLETE_TESTING_WORKFLOW.md`

**Everything works with just one command!** 🚀
