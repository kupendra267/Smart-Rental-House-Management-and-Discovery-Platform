# Smart Rental House Management and Discovery Platform - Project Overview

## 1. Abstract
The **Smart Rental House Management and Discovery Platform** is an end-to-end full-stack web application designed to overcome the critical friction points in contemporary urban house rental ecosystems. Traditional rental search relies heavily on unverified classifieds, informal broker networks, manual paper-based rent tracking, and subjective house searching. This project integrates:
1. **Interactive Geographic Search**: Interactive coordinate mapping with OpenStreetMap & Leaflet.
2. **AI-Powered Recommendation Microservice**: Real-time content-based and weighted cosine similarity ranking factoring in budget tolerance, BHK, tenant categories (bachelor/family), furnishing, and amenities with clear XAI explanations.
3. **Digital Rent & Lease Management**: Automated monthly rent obligations, server-side verified digital payment processing via Razorpay Sandbox, tamper-resistant unique digital receipt generation, and real-time tenant/owner transaction tracking.
4. **Multi-Role Governance**: Role-Based Access Control (RBAC) separating Tenants, Property Owners, and System Administrators with document verification, dispute/complaint moderation, and audit logging.

## 2. Key Objectives
- **Centralized Property Discovery**: High-performance multi-criteria search, area filtering, and interactive spatial discovery.
- **Explainable Match Scoring**: Real-time match scores (e.g. *94% Match*) that clearly articulate to the tenant why a property fits their lifestyle and budget.
- **Trust & Verification**: Mandatory administrative vetting of property listings and owner identity before public visibility.
- **Financial Transparency**: End-to-end digital lifecycle: Application $\rightarrow$ Rental Lease $\rightarrow$ Monthly Invoices $\rightarrow$ Online Payment Verification $\rightarrow$ PDF Receipts $\rightarrow$ Ledger History.
- **Maintenance & Dispute Resolution**: Digital ticketing system with priority escalation and transparent lifecycle states.

## 3. Technology Matrix
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, React Leaflet, React Router v6, Axios, Recharts.
- **Backend API**: Node.js, Express.js, Prisma ORM, JWT, bcryptjs, Zod, Nodemailer, Razorpay SDK.
- **Database**: PostgreSQL 15+ with strict referential constraints, indexing, and ACID transactions.
- **AI Recommendation**: Python 3.11+, FastAPI, Scikit-Learn, Pandas, NumPy.
- **DevOps**: Docker, Docker Compose, Postman API collections.
