# Digital Rent Payment & Receipt Architecture

## 1. End-to-End Payment Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Tenant
    participant Frontend as React Frontend
    participant Backend as Express Backend API
    participant Razorpay as Razorpay Gateway
    participant Database as PostgreSQL DB

    Tenant->>Frontend: Click "Pay Rent" on Invoice
    Frontend->>Backend: POST /api/payments/create-order { invoiceId }
    Backend->>Database: Verify invoice status == PENDING & lock amount
    Backend->>Razorpay: razorpay.orders.create({ amount, currency: 'INR', receipt })
    Razorpay-->>Backend: Order details (order_id)
    Backend-->>Frontend: { orderId, amount, keyId, currency }
    Frontend->>Razorpay: Open Razorpay Checkout Modal
    Tenant->>Razorpay: Enter card/UPI/netbanking details
    Razorpay-->>Frontend: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
    Frontend->>Backend: POST /api/payments/verify { orderId, paymentId, signature, invoiceId }
    Backend->>Backend: Generate expected HMAC SHA256 signature using PAYMENT_KEY_SECRET
    alt Signature Valid
        Backend->>Database: Transaction: Mark Invoice PAID, Insert Payment, Generate Receipt REC-YYYYMM-XXXX
        Backend->>Database: Trigger In-App & Email Notifications
        Backend-->>Frontend: { success: true, paymentId, receiptUrl }
        Frontend->>Tenant: Display Confirmed & Download Receipt Button
    else Signature Invalid
        Backend-->>Frontend: 400 Bad Request { success: false, message: "Payment signature mismatch" }
    end
```

## 2. Security & Verification Guarantees
1. **Server-Side Trust**: Payment amount is always queried directly from PostgreSQL invoice record, never trusting frontend parameters.
2. **Idempotent Invoicing**: Unique composite constraints on `(rental_id, billing_month)` prevent duplicate billing creation.
3. **Webhook Redundancy**: Webhook endpoint independently validates Razorpay HMAC signature to handle scenarios where tenant closes browser before client redirect.
4. **No Raw Card Storage**: Zero credit card, CVV, or banking details ever touch the database, adhering to strict PCI-DSS guidelines.
