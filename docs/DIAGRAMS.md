# 📐 Smart Rental Platform - UML & Engineering Architecture Diagrams

This document contains complete UML and engineering diagrams for the **Smart Rental House Management and Discovery Platform** capstone project.

---

## 1. System Architecture Diagram

```mermaid
graph TD
    Client["Client Browser (Desktop/Mobile)"] -->|"HTTPS / TLS"| Vercel["Vercel Edge CDN (React 18 + Vite SPA)"]
    Vercel -->|"REST API Requests"| APIGateway["Render Web Service (Node.js + Express API)"]
    
    subgraph "Backend Core Services"
        APIGateway --> Auth["JWT Auth & RBAC Middleware"]
        APIGateway --> PropSvc["Property Discovery & Filter Service"]
        APIGateway --> RentalSvc["Lease & Invoice Lifecycle Manager"]
        APIGateway --> PaySvc["Razorpay Sandbox & HMAC Verifier"]
        APIGateway --> NotifSvc["Real-time Notification Engine"]
    end
    
    subgraph "AI & External Microservices"
        PropSvc <-->|"HTTP / JSON"| MLService["Python FastAPI AI Recommendation Engine"]
        APIGateway <-->|"REST API"| Nominatim["OpenStreetMap Nominatim Geocoding API"]
        PaySvc <-->|"Webhook / Signature"| RazorpayAPI["Razorpay Payment Gateway"]
    end
    
    subgraph "Persistence Layer"
        APIGateway -->|"Prisma ORM"| PostgreSQL[("PostgreSQL Relational DB / In-Memory Store")]
    end
```

---

## 2. Use Case Diagram

```mermaid
graph LR
    Tenant((Tenant))
    Owner((Property Owner))
    Admin((System Administrator))

    subgraph "Smart Rental Platform Capabilities"
        UC1[Register / Login with JWT]
        UC2[Explore & Filter Properties with Map]
        UC3[View AI Match Score & Explanation]
        UC4[Side-by-Side Property Comparison]
        UC5[Save Favorite Properties]
        UC6[Submit Rental Application]
        UC7[Pay Rent via Razorpay Sandbox]
        UC8[Download Digital Tax Receipt]
        UC9[Submit Maintenance Request]
        UC10[Add New Property Listing with Map GPS]
        UC11[Approve / Reject Tenant Applications]
        UC12[Manage Active Leases & Invoices]
        UC13[Resolve Maintenance Tickets]
        UC14[Verify Property Listings]
        UC15[Platform Analytics & Dispute Resolution]
    end

    Tenant --> UC1
    Tenant --> UC2
    Tenant --> UC3
    Tenant --> UC4
    Tenant --> UC5
    Tenant --> UC6
    Tenant --> UC7
    Tenant --> UC8
    Tenant --> UC9

    Owner --> UC1
    Owner --> UC10
    Owner --> UC11
    Owner --> UC12
    Owner --> UC13

    Admin --> UC1
    Admin --> UC14
    Admin --> UC15
```

---

## 3. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USER ||--o{ TENANT_PROFILE : has
    USER ||--o{ OWNER_PROFILE : has
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ COMPLAINT : files

    OWNER_PROFILE ||--o{ PROPERTY : owns
    PROPERTY ||--|| PROPERTY_LOCATION : located_at
    PROPERTY ||--o{ PROPERTY_IMAGE : contains
    PROPERTY ||--o{ PROPERTY_AMENITY : features
    AMENITY ||--o{ PROPERTY_AMENITY : tagged_in

    TENANT_PROFILE ||--o{ FAVORITE : saves
    PROPERTY ||--o{ FAVORITE : favorited_by
    TENANT_PROFILE ||--o{ APPLICATION : submits
    PROPERTY ||--o{ APPLICATION : receives

    PROPERTY ||--o{ RENTAL : leased_in
    TENANT_PROFILE ||--o{ RENTAL : rents
    RENTAL ||--|| RENTAL_AGREEMENT : bound_by
    RENTAL ||--o{ RENT_INVOICE : generates
    RENT_INVOICE ||--o{ PAYMENT : settles
    PAYMENT ||--|| RECEIPT : generates
    RENTAL ||--o{ MAINTENANCE_REQUEST : reports
```

---

## 4. Sequence Diagram: Complete Rental & Payment Cycle

```mermaid
sequenceDiagram
    autonumber
    actor Tenant
    actor Owner
    participant Frontend as Frontend (Vercel)
    participant Backend as Backend API (Render)
    participant Razorpay as Razorpay Gateway
    participant DB as Relational Database

    Tenant->>Frontend: Shortlist House & Click "Apply"
    Frontend->>Backend: POST /api/applications { propertyId, moveInDate }
    Backend->>DB: Save Application (Status: PENDING)
    Backend-->>Frontend: Application Confirmed

    Owner->>Frontend: Review Application in Owner Dashboard
    Frontend->>Backend: PUT /api/applications/:id/approve
    Backend->>DB: Update Application (APPROVED)
    Backend->>DB: Create Active Rental Lease & 1st Month Invoice
    Backend-->>Owner: Lease Activated & Invoice Issued

    Tenant->>Frontend: Open Active Rental & Click "Pay Rent"
    Frontend->>Backend: POST /api/payments/create-order { invoiceId }
    Backend->>Razorpay: Generate Gateway Order (INR)
    Razorpay-->>Backend: Order ID returned
    Backend-->>Frontend: Razorpay Checkout Payload

    Tenant->>Razorpay: Authorize Payment via Sandbox UI
    Razorpay-->>Frontend: Payment Signature & Payment ID
    Frontend->>Backend: POST /api/payments/verify { orderId, paymentId, signature }
    Backend->>Backend: Verify HMAC-SHA256 Signature
    Backend->>DB: Mark Invoice PAID & Record Payment
    Backend->>DB: Generate Unique Digital Receipt (SR-REC-XXXX)
    Backend-->>Frontend: Payment Verified & Receipt Available
    Frontend-->>Tenant: Display Verified Digital Tax Receipt (View / Print)
```

---

## 5. Data Flow Diagram (DFD Level 0 & Level 1)

```mermaid
graph TD
    subgraph "External Entities"
        T[Tenant]
        O[Owner]
        A[Admin]
        RZ[Razorpay Gateway]
    end

    subgraph "Process 1.0: Authentication & Identity"
        P1[1.0 User Auth & JWT Token Issuance]
    end

    subgraph "Process 2.0: Property & Location Engine"
        P2[2.0 Property Management & Discovery]
    end

    subgraph "Process 3.0: Lease & Invoice Cycle"
        P3[3.0 Applications, Leases & Digital Billing]
    end

    subgraph "Process 4.0: Payment & Settlement"
        P4[4.0 Razorpay Verification & Receipt Generation]
    end

    subgraph "Data Stores"
        DS1[(D1: User Store)]
        DS2[(D2: Property & Map Store)]
        DS3[(D3: Leases & Invoices Store)]
        DS4[(D4: Transactions & Receipts Store)]
    end

    T -->|Credentials| P1
    O -->|Credentials| P1
    P1 -->|Read / Write| DS1

    O -->|Listing Data + GPS| P2
    P2 -->|Save Listing| DS2
    T -->|Search & Compare Queries| P2
    P2 -->|Filtered Results| T

    T -->|Rental Application| P3
    O -->|Approval Decision| P3
    P3 -->|Lease & Invoice Records| DS3

    T -->|Pay Invoice Request| P4
    P4 <-->|Order & HMAC Verification| RZ
    P4 -->|Mark Paid & Save Receipt| DS4
    DS4 -->|Download Receipt| T
```
