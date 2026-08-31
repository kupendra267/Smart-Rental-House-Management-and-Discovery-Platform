# Smart Rental House Management and Discovery Platform
> **Final Year Engineering Capstone Project**  
> An enterprise-grade, production-quality multi-role web platform and AI recommendation microservice for rental property discovery, owner property governance, and digital rent payments.

---

## 🌟 Key Capabilities & Highlights

1. **Multi-Role Governance**: Dedicated interfaces and permissions for **Tenants**, **Property Owners**, and **Platform Administrators**.
2. **AI Recommendation Microservice (FastAPI + Scikit-Learn)**: Multi-factor weighted cosine similarity algorithm computing match scores (e.g. `94% Match`) and Explainable AI (XAI) justifications.
3. **Interactive OpenStreetMap & Haversine Distance Search**: Real-time property map with custom price pins, popups, and radius distance filters.
4. **Digital Lease & Lifecycle Automation**: One-click application approval with automatic 1-year lease agreement generation and monthly rent invoice scheduling.
5. **Secure Online Rent Payments & Digital Receipts**: Server-side Razorpay order creation, HMAC SHA256 payment signature verification, and printable/downloadable digital receipts (`REC-YYYYMM-XXXX`).
6. **Maintenance & Grievance Ticketing**: Real-time ticket lifecycle tracking (`OPEN` $\rightarrow$ `ACKNOWLEDGED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED`).
7. **Admin Control Center**: Real-time analytics tracking revenue, active leases, property approval queues, user management, and security audit trails.

---

## 🏗️ Architecture & Tech Stack

```
+-------------------------------------------------------------------------------+
|                                CLIENT LAYER                                   |
|   React 18 + Vite + Tailwind CSS + Lucide Icons + React-Leaflet OpenStreetMap  |
+---------------------------------------+---------------------------------------+
                                        | (HTTPS / REST)
+---------------------------------------v---------------------------------------+
|                              NODE.JS BACKEND                                  |
|   Express.js API Gateway + JWT RBAC Middleware + Zod Validation + Winston     |
+-------------------+-----------------------------------+-----------------------+
                    |                                   |
                    | (HTTP Inter-service)              | (Prisma ORM)
+-------------------v-------------------+       +-------v-----------------------+
|         AI RECOMMENDATION SERVICE     |       |       POSTGRESQL DATABASE     |
|   FastAPI + Scikit-Learn + NumPy      |       |   21 Relational Tables        |
|   Multi-Factor Cosine Similarity      |       |   Normalized Schemas          |
+---------------------------------------+       +-------------------------------+
```

---

## 🚀 Quick Start Guide

### Option 1: One-Click Startup (Windows)
Double-click `start-all.bat` or run:
```cmd
start-all.bat
```

### Option 2: Docker Compose (All Services)
```bash
docker-compose up --build
```

### Option 3: Manual Startup
```bash
# 1. Start Backend API (Port 5000)
cd backend
npm install
npm run dev

# 2. Start Frontend UI (Port 5173)
cd ../frontend
npm install
npm run dev

# 3. (Optional) Start Python AI Microservice (Port 8000)
cd ../ml-service
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

---

## 🔑 Demo Login Credentials for Project Defense & Viva

All accounts share the standard password: **`Role@12345`**

| Role | Email Address | Password | Purpose / Focus |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@smartrental.com` | `Admin@12345` | Platform Analytics, Listing Approvals, User Governance |
| **Owner** | `owner1@smartrental.com` | `Owner@12345` | Listing Houses, Approving Applications, Maintenance |
| **Tenant** | `tenant1@smartrental.com` | `Tenant@12345` | AI Recommendations, Applying, Paying Rent, Receipts |

---

## 🧪 Automated Test Suite Verification

Run any of the end-to-end automated test suites in `backend/`:
```bash
# 1. Auth & RBAC Security Tests (9 Tests)
node backend/tests/run-auth-test.js

# 2. Properties & Search Tests (9 Tests)
node backend/tests/run-property-test.js

# 3. Full Rental Lifecycle & Razorpay Payment Tests (12 Steps)
node backend/tests/run-lifecycle-test.js

# 4. AI Recommendation Engine Tests
node backend/tests/run-ai-test.js
```

---

## 📚 Project Documentation
- **[Comprehensive Project Report](file:///docs/PROJECT_REPORT.md)**: System design, database ER schema, mathematical formulations, and security.
- **[Viva Voce Preparation Guide](file:///docs/VIVA_PREPARATION_GUIDE.md)**: 25+ targeted viva defense questions with expert answers.
