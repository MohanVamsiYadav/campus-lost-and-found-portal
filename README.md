# Campus Lost and Found Portal

Individual Web Technology project for Sai University, Academic Year 2026–2027.

## Features
- Responsive HTML/CSS/JavaScript frontend
- Node.js + Express REST API
- MongoDB database with Mongoose
- Registration, login, JWT authentication and role-based admin access
- Lost/found item CRUD, search and filters
- Claim submission and admin approval/rejection
- User dashboard and admin statistics
- Custom feature: newest/oldest date sorting
- Seed script creates 10 sample reports, a demo student and an admin

## Requirements
- Node.js 18 or later (20 LTS recommended)
- MongoDB Community Server running locally OR a MongoDB Atlas connection
- Git (optional for local run; required for GitHub submission)

## Run locally (macOS / Windows)
1. Install Node.js LTS and MongoDB Community Server, or create a free MongoDB Atlas database.
2. Extract this ZIP and open the `campus-lost-found-portal` folder in VS Code.
3. Open Terminal in that folder.
4. Run `npm install`.
5. Copy `.env.example` to `.env`.
6. Edit `.env`. For local MongoDB keep `MONGODB_URI=mongodb://127.0.0.1:27017/campus_lost_found`. Set a long random `JWT_SECRET` and change the admin password.
7. Run `npm run seed` once to create the admin, demo student and 10 sample items.
8. Run `npm run dev` (or `npm start`).
9. Open http://localhost:5000.

## Demo accounts
- Student: `student@campus.edu` / `Student123!`
- Admin: value of `ADMIN_EMAIL` / `ADMIN_PASSWORD` in your `.env` (defaults in `.env.example`).
Change these passwords before any public deployment. Do not commit `.env`.

## MongoDB Atlas
Create a free cluster and database user in MongoDB Atlas, allow your development IP in Network Access, copy the driver connection string, and put it in `MONGODB_URI`. Replace `<password>` with the database user's password and append `/campus_lost_found` before any query string if needed.

## API endpoints
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Health check |
| POST | `/api/auth/register` | Public | Register |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Login | Current user |
| GET | `/api/items` | Public | List/search/filter/sort |
| GET | `/api/items/:id` | Public | Get item |
| POST | `/api/items` | Login | Create report |
| PATCH | `/api/items/:id` | Owner/Admin | Update report |
| DELETE | `/api/items/:id` | Owner/Admin | Delete report |
| POST | `/api/claims` | Login | Submit claim |
| GET | `/api/claims/mine` | Login | My claims |
| GET | `/api/claims/received` | Login | Claims on my items |
| GET | `/api/admin/stats` | Admin | Dashboard statistics |
| GET | `/api/admin/claims` | Admin | All claims |
| PATCH | `/api/admin/claims/:id` | Admin | Approve/reject claim |
| GET | `/api/admin/items` | Admin | All items |
| PATCH | `/api/admin/items/:id/status` | Admin | Change item status |

## Postman
Import `postman/Campus-Lost-Found.postman_collection.json`. Set `baseUrl` to your server URL. Run the requests in order. The collection includes positive, invalid-input, CRUD, claim retrieval and unauthorized/role-protected checks. For a complete claim-approval demonstration, log in with the admin account and send:
`PATCH /api/admin/claims/CLAIM_ID` with JSON `{"status":"approved"}`.

## GitHub
Create a new empty GitHub repository. In this folder run:
```bash
git init
git add .
git commit -m "Initial Campus Lost and Found Portal"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/campus-lost-found-portal.git
git push -u origin main
```
Never upload `.env` or real passwords.

## Deployment (Render)
1. Push the project to GitHub.
2. Create a MongoDB Atlas database and allow network access for your deployment (follow Atlas security guidance; use a restricted database user).
3. In Render create a **Web Service** connected to the repository.
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables in Render: `MONGODB_URI`, `JWT_SECRET`, `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `NODE_ENV=production`.
7. Deploy. Open the Render URL and test login, report creation, search and claims.
8. For initial sample data, run `npm run seed` locally using the same Atlas `MONGODB_URI` and environment values, or use Render Shell if available.

## Important notes
- This is an educational starter implementation. Review it, understand it, change the branding/content, and test it before submission.
- The assignment asks for an individual demonstration/viva and AI-use disclosure where required. Disclose AI assistance according to your instructor's rules.
- Add your own screenshots to the report after running and testing the application.
