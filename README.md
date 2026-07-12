# AssetFlow — Enterprise Asset & Resource Management System

AssetFlow is a centralized ERP-style platform for managing organizational assets and shared resources.

It helps organizations track assets, manage allocations, prevent booking conflicts, handle maintenance workflows, and monitor asset activity from a single platform.

## Features

- Role-based authentication
- Department and category management
- Employee directory and role assignment
- Asset registration and lifecycle tracking
- Asset allocation and double-allocation prevention
- Transfer and return workflows
- Shared resource booking with overlap validation
- Maintenance request and approval workflow
- Asset audit and discrepancy tracking
- Dashboard KPIs, notifications, and activity logs

## User Roles

- **Admin** — Manages organization setup and employee roles
- **Asset Manager** — Registers, allocates, and maintains assets
- **Department Head** — Manages department assets and requests
- **Employee** — Views assets, books resources, and raises requests

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS  
**Backend:** Node.js, Express.js, TypeScript  
**Database:** PostgreSQL, Prisma ORM  
**Authentication:** JWT, bcrypt

## Project Structure

```text
assetflow/
├── client/   # React frontend
└── server/   # Express backend
```

## Setup

### Backend

```bash
cd server
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

Backend: `http://localhost:4000`

### Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Demo Accounts

Password for all demo accounts: `Password123!`

| Role | Email |
|---|---|
| Admin | admin@assetflow.com |
| Asset Manager | manager@assetflow.com |
| Department Head | depthead@assetflow.com |
| Employee | employee1@assetflow.com |

## Core Workflow

```text
Organization Setup
        ↓
Asset Registration
        ↓
Asset Allocation / Transfer / Return
        ↓
Resource Booking
        ↓
Maintenance Management
        ↓
Asset Audit
        ↓
Dashboard & Notifications
```

## Vision

AssetFlow provides organizations with centralized visibility into **who holds an asset, where it is, and its current condition**.

Built as a hackathon solution for efficient and transparent enterprise asset management.
