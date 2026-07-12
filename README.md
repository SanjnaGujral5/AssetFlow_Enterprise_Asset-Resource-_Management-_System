# AssetFlow — Phase 1

See the setup + run commands in the chat response. Quick start:

## Backend
cd server
cp .env.example .env   # then edit DATABASE_URL if needed
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev             # http://localhost:4000

## Frontend
cd client
cp .env.example .env
npm install
npm run dev              # http://localhost:5173

Demo accounts (password: Password123!):
- admin@assetflow.com (ADMIN)
- manager@assetflow.com (ASSET_MANAGER)
- depthead@assetflow.com (DEPT_HEAD)
- employee1@assetflow.com (EMPLOYEE)
- employee2@assetflow.com (EMPLOYEE)
