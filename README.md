# Closetrush 🛍️

Closetrush is a premium, multi-vendor rental e-commerce platform designed to bridge the gap between fashion owners (Sellers) and fashion enthusiasts (Rentals). It offers a seamless, high-end user experience for renting luxury and casual wear, complete with real-time chat, secure transactions, and a robust admin dashboard.

---

## 🌟 Key Features

### 🏪 For Vendors (Sellers)
- **Shop Management:** Create and customize your own rental shop.
- **Product Listing:** Easy-to-use interface for listing products with images, descriptions, and rental prices.
- **Wallet & Earnings:** Real-time tracking of earnings, pending balances, and withdrawals.
- **Order Management:** Accept or reject rental requests and track active rentals.
- **Chat System:** Direct communication with potential renters.

### 👗 For Renters (Buyers)
- **Smart Search & Filters:** Find the perfect outfit by category, price, or date availability.
- **Rental Tracking:** Real-time tracking of rental status (Requested → Confirmed → Picked Up → Active → Returned).
- **Secure Payments:** Integrated wallet and transaction system for safe payments.
- **Review System:** Rate and review products and sellers.

### 🛡️ Admin & Platform
- **Comprehensive Dashboard:** Overview of total users, vendors, rentals, and platform revenue.
- **User Management:** Manage customers, vendors, and delivery partners.
- **Commission System:** Automated 5% platform commission on every completed transaction.
- **Delivery Integration:** Automated delivery partner assignment and tracking.

---

## 💰 Financial Structure & Policies

Closetrush operates on a transparent, trust-based financial model. Below is the detailed breakdown of commissions, refunds, and earning formulas.

### 1. Commission Model
The platform charges a flat commission rate to sustain operations and marketing.

| **Metric** | **Rate / Formula** |
| :--- | :--- |
| **Platform Commission** | **5%** of the Base Rental Price |
| **Vendor Earning** | **95%** of the Base Rental Price |
| **Earning Formula** | `Earnings = Rental Price - (Rental Price * 0.05)` |

> *Example:* For a ₹1,000 rental, the Platform keeps ₹50, and the Vendor earns ₹950.

### 2. Wallet & Payout System
- **Pending Balance:** When an order is approved, the vendor's earnings are held in a "Pending" state.
- **Withdrawable Balance:** Upon successful completion of the rental (item returned), the funds are moved to "Withdrawable" and can be paid out.
- **Instant Updates:** Balances update in real-time as order statuses change.

### 3. Refund Policy (Buyers)
- **Pre-Approval Cancellation:** If a buyer cancels before the request is approved, they receive a **100% refund** to their wallet.
- **Rejection/Conflict:** If a seller rejects a request, or if the system auto-rejects it due to a scheduling conflict, the buyer receives a **100% automatic refund**.
- **Security Deposit:** The security deposit is fully refundable and is returned to the buyer's wallet immediately after the item is returned safely and verified.

### 4. Commission Refunds (Vendors)
- **Cancellation Waiver:** If a confirmed order is cancelled or refunded for any reason (before completion), the Platform Commission is **voided**.
- **No Hidden Fees:** Vendors are never charged a commission for unfulfilled, rejected, or cancelled orders. The system reverses any pending commission transactions automatically.

### 5. Damage & Security Deposits
- **Collection:** A Security Deposit may be collected at checkout to protect the vendor's asset.
- **Dispute Resolution:** In the event of damage, the cost is deducted from the Security Deposit.
- **Settlement:** 
  - `Buyer Refund = Security Deposit - Assessed Damage Cost`
  - `Vendor Compensation = Rental Earning + Assessed Damage Cost`

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React.js (Vite)
- **Styling:** TailwindCSS
- **Animations:** Framer Motion (for premium UI interactions)
- **State Management:** React Hooks & Context API
- **Routing:** React Router DOM v6
- **Build Tool:** Vite

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (with Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens)
- **Storage:** Local/Cloudinary (for image uploads)

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/closetrush.git
cd closetrush
```

### 2. Backend Setup
Navigate to the backend folder and install dependencies.
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
```

Start the backend server:
```bash
npm start
# OR for development
npm run dev
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend folder, and install dependencies.
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory with the following variables:
```env
VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

Start the frontend development server:
```bash
npm run dev
```

Your app should now be running at `http://localhost:5173`!

---

## 📡 API Overview

The backend exposes the following key RESTful endpoints:

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile

### Rentals
- `POST /api/rentals` - Create a rental request
- `GET /api/rentals/owner/:username` - Get seller's rentals
- `PUT /api/rentals/:id/status` - Update rental status
- `POST /api/rentals/:id/approve-with-rejection` - Approve rental & handle conflicts

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Add a new product
- `GET /api/products/:id` - Get product details

### Wallet
- `GET /api/wallet/:userId` - Get wallet balance
- `POST /api/wallet/add-funds` - Add funds to wallet

---

## 📄 License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for more details.
