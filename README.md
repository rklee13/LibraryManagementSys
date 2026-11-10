# MERN Stack Library Management System

A full-featured, **Library Management System** built using the MERN stack (**MongoDB, Express, React, Node.js**) with **TypeScript**. This application implements state architecture, modular layers, data access objects (DAOs), schema-based validations, and multi-tier user role permissions.

## 🚀 Key Features & System Architecture

### Multi-Tier User Matrix
*   **Guests:** Unauthenticated users who can view the home landing layout, access the open catalog overview, and conduct basic keyword searches.
*   **Patrons:** Registered and authenticated library attendees capable of checking out their unique digital library cards, reviewing custom loan histories, and managing profile credentials.
*   **Employees (Librarians):** Administrative staff possessing advanced data authorization to actively scan barcodes, process real-time book check-ins/check-outs for patrons, and monitor global catalog records.
*   **Admins:** High-level executives with overarching backend data control capabilities.

### Core Functionality
*   **Dynamic Catalog System:** Scroll book carousels segregated by genres and subjects utilizing customizable fuzzy query strings.
*   **Fuzzy Searching & Advanced Querying:** Clean REST API lookup routes matching criteria variations across ISBNs, titles, authors, and descriptions.
*   **Automated Pagination Engine:** Efficient client and server-side slice calculations optimizing massive book inventories for active page limits.
*   **Digital Library Cards:** Distinct schema IDs mapped securely to user accounts to track item transactions.
*   **Robust Record Tracking:** Granular logging monitoring every state change a book makes, tracking loan timestamps, due dates, and assigning clerk accounts.

---

## 🛠️ Tech Stack & Prerequisites

### Technologies Used
*   **Backend:** Node.js, Express, Mongoose (MongoDB ODM), TypeScript.
*   **Frontend:** React (Functional Components & Hooks), Redux Toolkit (React Redux), Axios, Material UI (MUI Icons).
*   **Validation & Security:** Joi (Schema Validator), Bcrypt (Password Hashing).
*   **DevOps & Environment:** Docker (Local MongoDB community container virtualization), Concurrently, Nodemon, Dotenv.

### Prerequisites
Ensure the following are installed globally on your machine:
*   [Node.js](https://nodejs.org) (Latest LTS recommended)
*   [Docker Desktop](https://docker.com) (For local database containerization)
*   TypeScript compiler (`npm i -g typescript`)
*   [Postman Client](https://postman.com) (Optional, for API route verification)

---

## 💻 Installation & Setup Guide

### 1. Database Setup (Docker)
Spin up an isolated local MongoDB instance instantly without modifying your host files:
```bash
# Pull and start the MongoDB container
docker run -d --name mongodb -p 27017:27017 mongodb/mongodb-community-server:latest

# Enter the MongoDB bash container shell
winpty docker exec -it mongodb mongosh

# Switch to the project database context and seed a user
use LibraryDB
db.createUser({
  user: "user",
  pwd: "password",
  roles: [{ role: "readWrite", db: "LibraryDB" }]
})
exit
```

### 2. Server Configuration & Run
Navigate into the server folder, configure your environment secrets, and establish the server runtime dependencies:
```bash
cd library-server
npm install
```
Create your local environment file by copying the template:
```bash
cp .env.example .env
```
Open the newly created `.env` file and verify it matches your local credentials:
```env
SERVER_PORT=8000
SERVER_ROUNDS=10
MONGO_USERNAME=user
MONGO_PASSWORD=password
```
To run the server concurrently with watch compiler processes:
```bash
npm run dev
```

### 3. Client Configuration & Run
Open a secondary terminal, navigate to the web application folder, and download node packages:
```bash
cd library-app
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser to view the operational dashboard.

---

## 🌐 Production Deployment Guide

Follow these steps to build and compile the application for production hosting environments (e.g., Render, Railway, Vercel, AWS).

### 1. Production Build Commands
Before deploying, ensure you compile the TypeScript files and optimize the static frontend asset bundles.

* **Backend Build (TypeScript to JavaScript Compilation):**
  ```bash
  cd library-server
  npm run build
  ```
  *This automatically generates the optimized `dist/` production folder.*

* **Frontend Build (Vite Asset Minimization):**
  ```bash
  cd library-app
  npm run build
  ```
  *This creates a highly compressed `dist/` directory containing static HTML, CSS, and JS files ready for a CDN.*

### 2. Environment Configurations for Production
Never use local development credentials (`localhost`) in your live environment variables. Ensure your hosting dashboard includes the following live keys:

#### Server / API Configuration Keys:
```env
NODE_ENV=production
SERVER_PORT=8080
SERVER_ROUNDS=12
MONGO_USERNAME=prod_db_user
MONGO_PASSWORD=your_secure_production_password
# Ensure this points to your hosted MongoDB cluster (e.g., MongoDB Atlas)
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/LibraryDB
```

#### Client Configuration Keys:
```env
# Change this to match your actual live backend API URL
VITE_API_BASE_URL=https://onrender.com
```

### 3. Execution in Production
To run the project on a live infrastructure node after bundling, do not use `dev` watcher utilities. Fire up the optimized production servers:

* **Starting the Backend Instance:**
  ```bash
  cd library-server
  npm start
  ```
* **Serving the Frontend Layout:**
  Deploy the static contents inside `library-app/dist` to a managed global edge network provider (like Vercel or Netlify) which handles static file routing automatically.


## 📂 Project Structure Overview

The system architecture utilizes a strict layer boundary layout to decouple business logic from framework rendering:

```filepath
├── library-server/           # Node.js + TypeScript Backend
│   ├── src/
│   │   ├── config/           # App secrets parsing & config mapping
│   │   ├── controllers/      # Route orchestration layers
│   │   ├── daos/             # Direct Mongoose DB Access Schemas
│   │   ├── middlewares/      # Request Joi object parsing validation
│   │   ├── models/           # Strictly typed TypeScript Interfaces
│   │   ├── routes/           # REST Endpoint URL mapping
│   │   ├── utils/            # Custom application errors handling
│   │   ├── services/         # Intermediary layer between the controller and model
│   │   └── server.ts         # Initial execution startup file
│   └── .env.example          # Template environment configurations (Tracked)
│
└── library-app/              # React + TypeScript Frontend
    ├── src/
    │   ├── components/       # Shared generic global layout widgets (Modals)
    │   ├── features/         # Logic slices grouped by business actions
    │   │   ├── authentication/
    │   │   ├── book/
    │   │   ├── catalog/
    │   │   ├── landing/
    │   │   ├── navigation/
    │   │   └── profile/
    │   ├── models/           # Mirror typing structures matching the API
    │   ├── pages/            # Core template layout view injection pages
    │   ├── redux/            # Unified global slice store managers
    │   ├── App.tsx           # Client browser router routing matrix
    │   └── index.tsx          # System state tree bootstrap context
```

---

## 🛡️ API Endpoints Reference

The backend layer enforces request validation on incoming parameters before letting payload requests access service tiers:

| Method | Endpoint | Description | Layer Protection |
| :--- | :--- | :--- | :--- |
| **POST** | `/auth/register` | Signs up a brand new system patron | Body validation |
| **POST** | `/auth/login` | Validates profile credentials returning data | Body validation |
| **GET** | `/users/` | Returns a list of all library profiles | - |
| **GET** | `/users/:id` | Locates specific member profile by index ID | Params validation |
| **PUT** | `/users/` | Updates an individual profile's meta details | Body validation |
| **DELETE** | `/users/:id` | Deletes specific member profile by index ID | Params validation |
| **GET** | `/book/` | Pulls entire collection of catalogs | - |
| **POST** | `/book/` | Registers a specific book | Body validation |
| **PUT** | `/book/` | Updates a specific books' meta details | Body validation |
| **DELETE** | `/book/:barcode` | Deletes a specific book | Params validation |
| **GET** | `/book/query` | Generates a dynamic schema look-up search list | Fuzzy params parsing |
| **GET** | `/card/:cardId` | Locates specific member's library card by index ID | Params validation |
| **POST** | `/card/` | Creates a member's libary card | Body validation |
| **GET** | `/loan` | Returns a list of all library loans | - |
| **POST** | `/loan/` | Spins up a historical tracking borrowing receipt | Body mapping validation |
| **PUT** | `/loan/` | Finalizes a checking return on an open loan item | Updated stamp check |
| **POST** | `/loan/query` | Searches for loan records based on params | Body mapping validation |