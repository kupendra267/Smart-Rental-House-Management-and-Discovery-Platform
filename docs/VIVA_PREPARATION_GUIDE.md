# Smart Rental House Management and Discovery Platform
## Comprehensive Viva Voce Preparation & Project Defense Guide

---

### 1. Architectural & High-Level Questions

#### Q1: What is the high-level architecture of your project?
**Answer**:
The platform utilizes a **Microservice-oriented Monorepo architecture**:
- **Client Tier**: Single Page Application (SPA) built with React 18, Vite, and Tailwind CSS.
- **API Gateway & Core Business Tier**: Node.js + Express REST API handling user authentication, role-based access control, lease lifecycle management, Razorpay payment processing, and PostgreSQL database persistence via Prisma ORM.
- **AI Recommendation Tier**: Python FastAPI microservice utilizing NumPy and Scikit-learn to execute multi-factor weighted scoring and vector cosine similarity.
- **Database Tier**: Relational PostgreSQL database with 21 normalized tables.

#### Q2: Why did you separate the AI Recommendation engine into a separate FastAPI service instead of running it in Node.js?
**Answer**:
Python is the industry standard for machine learning due to its rich ecosystem of optimized C-extensions (NumPy, Scikit-learn, Pandas). Isolating the ranking algorithm into a dedicated FastAPI microservice ensures:
1. **CPU Isolation**: Intensive mathematical vector calculations don't block the Node.js event loop.
2. **Independent Scalability**: The AI service can be scaled independently on CPU/GPU instances without replicating the transactional web server.
3. **High Availability**: The Node.js gateway incorporates a graceful fallback ranking algorithm if the ML microservice is unreachable.

---

### 2. Database & Data Modeling Questions

#### Q3: Explain your database schema and normalization level.
**Answer**:
The database is designed in **Third Normal Form (3NF)** across 21 relational models.
- Core entities like `User` are separated from role-specific profiles (`TenantProfile`, `OwnerProfile`, `AdminProfile`) to eliminate null values and maintain clean 1-to-1 relationships.
- Properties, locations, amenities, images, leases, invoices, payments, receipts, and maintenance tickets are separated into distinct tables connected via foreign key constraints and indexed for fast retrieval.
- Financial auditability is maintained by separating `RentInvoice` (the monthly obligation), `Payment` (the gateway transaction), and `Receipt` (the immutable legal proof of payment).

#### Q4: How do you prevent race conditions and double bookings when multiple tenants apply for the same house?
**Answer**:
1. When a property is rented, its status field is updated to `RENTED`.
2. The application submission endpoint verifies that the property status is `AVAILABLE` and checks for duplicate active applications from the same tenant.
3. When an owner approves an application, the status transition is executed inside a transaction: the application status changes to `APPROVED`, the property status changes to `RENTED`, any competing pending applications can be archived, and the active `Rental` lease record is created.

---

### 3. Payment Gateway & Security Questions

#### Q5: How do you ensure that a malicious user cannot alter the rent amount during payment?
**Answer**:
We implement **Server-Side Order Authority**:
1. The frontend never passes the payment amount to Razorpay. It only passes the `invoiceId`.
2. The backend fetches the `RentInvoice` directly from the database and constructs the Razorpay order using the verified database amount converted to paise (`totalAmount * 100`).
3. During verification, the backend verifies the cryptographic HMAC SHA256 digital signature:
   \[
   \text{ExpectedSignature} = \text{HMAC-SHA256}(\text{order\_id} + "|" + \text{payment\_id}, \text{SECRET\_KEY})
   \]
4. Only when the signature matches does the backend mark the invoice as `PAID` and issue a unique receipt (`REC-YYYYMM-XXXX`).

#### Q6: How are user passwords stored securely?
**Answer**:
Passwords are encrypted using `bcrypt` with 10 salt rounds before persistence. The system never stores plain text passwords and compares incoming passwords during authentication using `bcrypt.compare`.

---

### 4. AI Recommendation & ML Questions

#### Q7: What formula does your AI recommendation algorithm use?
**Answer**:
We use a **Multi-Factor Weighted Scoring Model**:
\[
\text{MatchScore} = 0.25 \cdot \text{Budget} + 0.25 \cdot \text{Location} + 0.15 \cdot \text{BHK} + 0.10 \cdot \text{Type} + 0.10 \cdot \text{Preference} + 0.10 \cdot \text{Amenities} + 0.05 \cdot \text{Distance}
\]
- **Budget**: Uses a Gaussian decay function for properties exceeding the tenant's ceiling budget.
- **Amenities**: Computes the Jaccard similarity between tenant desired amenities and property amenities.
- **Distance**: Computes the Haversine spherical distance using geographic latitude and longitude.
- **Explainable AI (XAI)**: Generates human-readable explanation bullets detailing why the home was recommended.

---

### 5. Quick Viva Demonstration Cheat Sheet

| Role | Email | Password | Primary Viva Features to Demonstrate |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@smartrental.com` | `Admin@12345` | Platform Analytics, Listing Approvals Queue, User Governance, Audit Trail Logs |
| **Owner** | `owner1@smartrental.com` | `Owner@12345` | Property Listing Form, Reviewing Tenant Applications, Approving Leases, Maintenance Management |
| **Tenant** | `tenant1@smartrental.com` | `Tenant@12345` | Multi-filter Search, Map Exploration, AI Recommendations, 1-Click Apply, Razorpay Rent Payment & Digital PDF Receipts |
