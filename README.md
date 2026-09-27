# Vehicle Data Ingestion & GraphQL Service

Backend service written in TypeScript to ingest vehicle make and type XML data from public NHTSA APIs, transform it into structured JSON, persist it to an SQLite datastore, and expose it via a GraphQL interface.

## Core Features

- **Data Ingestion Pipeline:** Parses XML responses from NHTSA and normalizes them into relational models.
- **Persistent Storage:** SQLite storage with indexed relationships (`better-sqlite3`).
- **GraphQL API:** Type-safe queries for fetching vehicle makes with related vehicle types.
- **Fail-Safe Startup:** Runtime configuration validated using Zod.
- **Structured Logging:** Pino JSON logs for production observability.
- **Automated Testing:** Unit test suite covering data transformers and XML normalization.

---

## Getting Started

### 1. Prerequisites

- Node.js 20+
- Docker (optional)

### 2. Local Setup

```bash
# Install dependencies
npm install

# Run automated tests
npm test

# Start service in dev mode
npx ts-node src/index.ts
```
