# Transparent Intercity Bus Ticket Cancellation & Refund System

## Overview
Intercity bus ticket cancellations and refunds are often unclear, inconsistent, and difficult for passengers to track. This project aims to build an **open and transparent full-stack platform** that standardizes cancellation policies, explains refund calculations clearly, and provides real-time refund tracking to improve trust and accountability in public transport systems.

---

## Problem Statement
Intercity bus ticket cancellations and refunds are opaque and inconsistent. Passengers face unclear policies, hidden deductions, delayed refunds, and lack of accountability from operators. This results in low trust and frequent disputes.

---

## Project Goal
To design and implement a transparent, verifiable system that:
- Clearly displays cancellation and refund policies  
- Explains refund calculations step-by-step  
- Tracks refund status in real time  
- Maintains an audit trail for accountability  

---

## Key Features
- **Policy Transparency:** Publicly visible, standardized cancellation and refund rules  
- **Ticket Cancellation Workflow:** Simple and clear cancellation process  
- **Refund Breakdown:** Detailed explanation of refund amount and deductions  
- **Real-Time Tracking:** Track refund status from request to completion  
- **Audit Logs:** Immutable logs of all cancellation and refund actions  
- **Admin/Operator Dashboard:** Manage policies, refunds, and compliance  

---

## Technology Stack
- **Frontend:** Next.js (TypeScript)  
- **Backend:** Next.js API Routes  
- **Database:** PostgreSQL  
- **ORM:** Prisma  
- **Caching:** Redis  
- **Containerization:** Docker  
- **Cloud Deployment:** AWS / Azure  
- **CI/CD:** GitHub Actions  
- **Version Control:** GitHub  

---

## Team
- **Lakshmi Shankar** – Full-Stack Lead  
  - System architecture  
  - Frontend development  
  - API integration  
  - Documentation  

- **Dhanya Lakshmi** – Backend & DevOps Lead  
  - Database schema design  
  - Backend API development  
  - Cloud deployment  
  - CI/CD and testing  

---

## Sprint Plan (4 Weeks)

### Week 1 – Planning & Design
- Requirement analysis  
- System architecture design  
- Database schema creation  
- UI wireframes  

### Week 2 – Backend Development
- Authentication and role management  
- Cancellation and refund APIs  
- Refund calculation logic  
- Audit logging and Redis integration  

### Week 3 – Frontend Development
- User and admin dashboards  
- API integration  
- UI testing and refinements  

### Week 4 – Deployment & Testing
- Dockerization  
- Cloud deployment (AWS/Azure)  
- CI/CD pipeline setup  
- End-to-end testing and documentation  

---

## Success Criteria
- Cancellation policies clearly visible to users  
- Refund calculations fully transparent  
- Real-time refund tracking available  
- All actions recorded in audit logs  
- Application successfully deployed to cloud  
- Automated CI/CD pipeline functioning  

---

## Expected Impact
- Increased passenger trust  
- Improved accountability of bus operators  
- Reduced disputes related to refunds  
- Scalable foundation for public transport digital systems  

---

## License
This project is developed for academic and learning purposes as part of a 4-week sprint.


Below is a **ready-to-paste README section** that clearly documents all four points in a professional, reviewer-friendly way. You can adapt names of tools if needed.

---

## 🧩 Code Quality & Consistency

This project enforces strict code quality standards using **TypeScript (strict mode)**, **ESLint**, **Prettier**, and **pre-commit hooks** to minimize runtime bugs and maintain team-wide consistency.

---

### 1. Why Strict TypeScript Mode Reduces Runtime Bugs

Strict TypeScript mode (`"strict": true` in `tsconfig.json`) enables a set of powerful compile-time checks that catch errors **before the code runs**.

Key benefits:

* **No implicit `any`**: Prevents variables from silently becoming untyped.
* **Strict null checks**: Forces handling of `null` and `undefined`, avoiding common runtime crashes.
* **Safer function contracts**: Ensures parameters and return types are correctly used.
* **Early bug detection**: Many logic errors are caught during development instead of in production.

Result:
 Fewer unexpected crashes, safer refactoring, and more predictable behavior.

---

### 2. ESLint + Prettier Rules Enforced

This project uses **ESLint** for code correctness and **Prettier** for formatting.

#### ESLint enforces:

* No unused variables or imports
* Consistent use of `const` over `let` where possible
* Proper React hooks usage (if applicable)
* Prevention of common JavaScript/TypeScript anti-patterns
* Consistent error handling and clean code practices

#### Prettier enforces:

* Consistent indentation and spacing
* Uniform quote style
* Standardized line length
* Automatic formatting on save or commit

Result:
 Clean, readable code with zero formatting debates during reviews.

---

### 3. How Pre-commit Hooks Improve Team Consistency

Pre-commit hooks (using tools like **Husky** and **lint-staged**) automatically run checks **before code is committed**.

They ensure:

* ESLint passes before any commit
* Code is formatted with Prettier
* Broken or non-compliant code never enters the repository
* All contributors follow the same standards without manual enforcement

Result:
 Fewer CI failures, cleaner pull requests, and smoother collaboration.

---

### 4. Linting Evidence (Screenshots / Logs)

#### Successful Lint Run (Example)

```bash
✔ ESLint: No issues found
✔ Prettier: Code formatted successfully
✔ Pre-commit checks passed
```

#### Example of Fixed Violations

Before:

```ts
function greet(name) {
  console.log("Hello " + name)
}
```

After ESLint + Prettier:

```ts
function greet(name: string): void {
  console.log(`Hello ${name}`);
}
```

>  **Screenshots:**
> Add screenshots of:
  ![alt text](lint-result.png)

---

### Summary

By combining **Strict TypeScript**, **ESLint**, **Prettier**, and **pre-commit hooks**, this project achieves:

* Early bug detection
* Consistent coding standards
* Cleaner commits
* Better long-term maintainability

---

## Environment Variables

This project uses environment variables to manage configuration securely across development and production environments.

### Environment Files Used

* `.env.local` → Local development (not committed)
* `.env.production` → Production values (not committed)
* `.env.example` → Template for contributors (committed)

---

### Server-side vs Client-side Variables

#### Server-side only (Never exposed)

These variables **must not** be prefixed with `NEXT_PUBLIC_` and are accessible only on the server:

* `DATABASE_URL`
* `JWT_SECRET`
* `API_BASE_URL`

These are used in:

* API routes
* Server components
* Backend services

#### Client-side safe variables

Variables prefixed with `NEXT_PUBLIC_` are embedded into the frontend bundle and **are publicly readable**:

* `NEXT_PUBLIC_API_BASE_URL`
* `NEXT_PUBLIC_APP_URL`

Only non-sensitive values should use this prefix.

---

# Team Branching & Pull Request Workflow

This repository follows a professional GitHub workflow similar to real-world engineering teams. The workflow is designed to ensure clean code, consistent collaboration, and high-quality contributions.

---

## Branching Strategy & Naming Conventions

All development work is done on separate branches. Direct commits to the `main` branch are not allowed.

### Branch Naming Format

The team follows a consistent branch naming convention:

- `feature/<feature-name>` – For new features  
  Example: `feature/login-auth`

- `fix/<bug-name>` – For bug fixes  
  Example: `fix/navbar-alignment`

- `chore/<task-name>` – For maintenance or setup tasks  
  Example: `chore/update-dependencies`

- `docs/<update-name>` – For documentation updates  
  Example: `docs/update-readme`

This convention improves clarity, traceability, and collaboration among team members.

---

## Pull Request (PR) Template

All changes are submitted through Pull Requests using a standard template `located` at:

`.gitHub/pull_request_template.md`


Here is a **clean, small, evaluator-friendly README** you can directly use.
It explains *just enough* and matches what you actually built.

---

# Dockerized Setup

This project containerizes a **Next.js application**, **PostgreSQL database**, and **Redis cache** using **Docker** and **Docker Compose** to provide a consistent local development environment.

---

## Tech Stack

* Next.js (Node.js 20)
* PostgreSQL 15
* Redis 7
* Docker & Docker Compose (v2)

---

## How to Run Locally

Make sure Docker is installed and running.

```bash
docker compose up --build
```

---

## Service Verification

* **Next.js App**: [http://localhost:3000](http://localhost:3000)
* **PostgreSQL**: running on port `5432` *inside Docker* (`db:5432`)
* **Redis**: running on port `6379` *inside Docker* (`redis:6379`)

PostgreSQL and Redis are accessed internally via Docker networking and are not exposed to the host machine.

---

## Docker Overview

* **Dockerfile** builds and runs the Next.js app inside a Node.js container
* **docker-compose.yml** orchestrates:

  * `app` – Next.js application
  * `db` – PostgreSQL with persistent volume
  * `redis` – Redis cache
* All services run on a shared Docker network

---

## Stopping the Containers

```bash
docker compose down
```

---

This setup ensures team consistency and mirrors production-style container networking.



# Prisma ORM Integration

Prisma ORM is used as the data access layer to connect the Next.js application with a PostgreSQL database. It provides type-safe queries, centralized schema management, and improves overall backend reliability.

## Setup

Prisma was installed and initialized using:

```bash
npm install prisma --save-dev
npx prisma init
```

This created the `/prisma/schema.prisma` file and added `DATABASE_URL` in `.env`.

## Schema & Models

Models are defined in `schema.prisma` to represent database tables and relationships. Example models include `User` and `Project`, where one user can have multiple projects using Prisma relations.

## Prisma Client

The Prisma Client was generated using:

```bash
npx prisma generate
```

A singleton Prisma Client was configured in `src/lib/prisma.ts` to prevent multiple database connections during development.

## Testing

A test query using `prisma.user.findMany()` confirmed successful connection between Prisma and PostgreSQL.

## Conclusion

Prisma simplifies database operations by providing strong type safety, cleaner queries, and better developer productivity, making it a reliable ORM for full-stack Next.js applications.



### RESTful API Design (Next.js App Router)

This project demonstrates how to design clean, RESTful API routes using **Next.js App Router** and file-based routing under the `/app/api` directory.

All API endpoints are organized by **resources** (users, projects, tasks) using **plural, lowercase nouns** to ensure consistency and predictability.

Each folder inside `app/api/` represents a resource, and each `route.ts` file defines HTTP method handlers such as `GET`, `POST`, `PUT/PATCH`, and `DELETE`.

#### API Route Structure

* `/api/users` – manage users
* `/api/users/[id]` – operations on a specific user
* `/api/projects` – manage projects
* `/api/tasks` – manage tasks

#### REST Conventions

* `GET` → fetch data
* `POST` → create data
* `PUT / PATCH` → update data
* `DELETE` → remove data

#### Features

* Resource-based routing (no verbs in URLs)
* Pagination support using query params (`page`, `limit`)
* Proper HTTP status codes (`200`, `201`, `400`, `404`, `500`)
* JSON-based request and response format
* Clear error handling for missing or invalid data

#### Testing

All endpoints were tested using **curl/Postman** to verify:

* Correct HTTP methods
* Valid JSON responses
* Pagination and error behavior

#### Reflection

Consistent naming and predictable routes make the API easier to use, debug, and scale. A well-structured API reduces integration errors and improves long-term maintainability.
