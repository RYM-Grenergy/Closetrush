# Closetrush Rental & Return Workflows

This document outlines the operational flow of the Closetrush platform, detailing how clothes move between Sellers and Buyers, and how delivery/logistics are controlled.

---

## 1. Outbound Flow: Seller to Buyer
This flow covers the lifecycle from product listing to delivery at the Buyer's doorstep.

| Stage | Action | Control/Actor | Rental Status | Product Status |
| :--- | :--- | :--- | :--- | :--- |
| **Listing** | Seller uploads product details & images. | **Seller** | N/A | `pending_admin_approval` |
| **Approval** | Admin reviews and activates the listing. | **Admin** | N/A | `active` |
| **Booking** | Buyer selects dates and pays for the rental. | **Buyer** | `requested` | `active` |
| **Confirmation** | Seller accepts the rental request. | **Seller** | `confirmed` | `on_rent` |
| **Dispatch** | Logistics assigned; Partner picks up from Seller. | **Logistics** | `picked_up` | `on_rent` |
| **Delivery** | Partner delivers the item to the Buyer. | **Logistics** | `active` | `on_rent` |

---

## 2. Inbound Flow: Buyer to Seller (Return)
This flow covers the lifecycle from the end of the rental period back to the Seller.

| Stage | Action | Control/Actor | Rental Status | Product Status |
| :--- | :--- | :--- | :--- | :--- |
| **Request** | Buyer initiates return (manual or auto-triggered). | **Buyer** | `pickupRequested: true` | `on_rent` |
| **Assignment** | Admin/System assigns a partner for return pickup. | **Logistics** | `assigned` | `active` (Available for next) |
| **Pickup** | Partner picks up the item from the Buyer. | **Logistics** | `picked_from_buyer` | `active` |
| **Return** | Partner delivers the item back to the Seller. | **Logistics** | `returned` | `active` |
| **Settlement** | Seller inspects item; Funds released to Seller. | **Seller / Admin** | `completed` | `active` |

---

## 3. Control Centers

### **Buyer Controls**
*   **Discovery**: Searching and filtering available products.
*   **Initiation**: Placing rental requests and making payments.
*   **Returns**: Triggering the "Initiate Return" action to request a pickup.
*   **Early Returns**: Requesting to return the item before the end date.

### **Seller Controls**
*   **Inventory**: Managing product details, availability, and pricing.
*   **Approval**: Accepting or rejecting rental requests (Accepting starts the logistics flow).
*   **Handover**: Handing over the item to the delivery partner.
*   **Inspection**: Confirming the condition of the garment upon return (Final closure).

### **Delivery & Logistics (Admin/Partner) Controls**
*   **Fleet Management**: Managing delivery partners and their availability.
*   **Tracking**: Updating statuses from `assigned` → `picked_up` → `delivered_to_buyer`.
*   **Return Logistics**: Updating statuses from `picked_from_buyer` → `returned_to_seller`.
*   **Status Sync**: Ensuring the product becomes "Available" on the website as soon as it is picked up from the buyer.

---

## 4. Key Status Legend
*   **`requested`**: Waiting for Seller's nod.
*   **`confirmed`**: Seller said yes; Waiting for Logistics.
*   **`picked_up`**: Item is with the delivery partner (Outbound).
*   **`active`**: Item is with the Buyer; Rental clock is ticking.
*   **`returned`**: Item is back with the Seller.
*   **`completed`**: Everything is finished; Money transferred.
