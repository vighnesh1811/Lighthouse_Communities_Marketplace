# Lighthouse Communities Marketplace

A full-stack college project marketplace concept for products created through skill development and opportunity-building programs. Product listings are controlled by authorized administrators; there is no student seller account.

## Current Phase

The core demo flow is complete: React/Vite client shell, Express API, MySQL schema, catalogue, cart, checkout, COD/QR payment states, order tracking, cancellation, admin authentication, product management, order management, payment review, and sourced public information pages.

The supplied Lighthouse logo should be placed at `client-assets/lighthouse-logo.png` when the workspace asset is available. The official payment QR code is intentionally not included; use the configured path only after the NGO provides the real QR image.

## Stack

- React, Vite, Bootstrap 5, Bootstrap Icons
- Node.js, Express, CORS, dotenv
- MySQL, mysql2
- Later phases: bcrypt, JWT, Multer, express-validator

## Run the Client

```powershell
npm install
npm run dev
```

Open `http://localhost:5173`.

## Run the API

Copy `.env.example` to `.env`, update the MySQL values and JWT secret, then run:

```powershell
npm run server:dev
```

The health endpoint is available at `http://localhost:5000/api/health` and should return JSON with `status: "ok"`.

## Set Up MySQL

Open MySQL Workbench or the MySQL CLI and run:

```sql
SOURCE database/schema.sql;
SOURCE database/seed.sql;
```

The seed rows are explicitly demo data and must not be presented as verified Lighthouse products.

## Folder Structure

```text
client: React frontend in src/
server/src: Express app, routes, configuration, and middleware
database: MySQL schema and demo seed data
client-assets: supplied brand assets before they are copied into public/
```

## Planned URLs

- `/` public marketplace
- `/shop` product catalogue
- `/checkout` guest checkout
- `/track-order` order tracking
- `/about` Lighthouse information
- `/contact` official contact information
- `/leadership` sourced leadership listing
- `/privacy` project privacy policy
- `/admin/login` secure admin login
- `/admin/dashboard` protected admin area

Development admin after rerunning `database/seed.sql`:

- Email: `admin@lighthouse.local`
- Password: `ChangeMe123!`

Change this development credential before any non-local use.

## Important Rules

- Admins alone manage products, categories, stock, orders, and payment verification.
- Only COD and manual NGO QR payment will be supported.
- QR payments remain pending until manually verified.
- The NGO handles delivery directly; no courier or GPS integration is planned.
- Official NGO facts, leadership, contact details, impact numbers, and policies must be verified before being added.

## Future Scope

Customer accounts, wishlist, reviews, coupons, notifications, automated payment gateways, advanced analytics, and delivery partner APIs are intentionally deferred.