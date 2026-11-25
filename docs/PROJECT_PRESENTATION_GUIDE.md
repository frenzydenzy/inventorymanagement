# Inventory Management System
## Project Presentation and Technical Preparation Guide

## 1. Project Overview

The Inventory Management System is a full-stack application for managing products, categories, suppliers, stock quantities, and inventory transaction history.

The system is divided into two applications:

- **Frontend:** React and TypeScript single-page application.
- **Backend:** FastAPI REST API connected to MySQL through SQLAlchemy.

The main goal is to provide a reliable interface for catalog management and stock movement tracking while keeping inventory transactions auditable and immutable.

### Main capabilities

- Dashboard summary statistics
- Product creation, listing, updating, and deletion
- Product search, filtering, and pagination
- Inline category and supplier creation from the product form
- Category management
- Supplier management
- Stock-in operations
- Stock-out operations
- Insufficient-stock protection
- Inventory transaction history
- Product-based transaction filtering
- Validation and error handling
- Minimalist responsive dashboard interface

The project intentionally does not include Orders, Sales, Payments, Authentication, GraphQL, or accounting functionality.

---

## 2. High-Level Architecture

```text
User
  |
  v
React + TypeScript Frontend
  |
  |  Axios REST requests
  v
FastAPI Backend
  |
  v
Pydantic Validation
  |
  v
CRUD and Business Logic
  |
  v
SQLAlchemy ORM
  |
  v
MySQL Database
```

### Architectural responsibilities

| Layer | Responsibility |
|---|---|
| React pages | Screen-level state, data loading, mutation orchestration, and page presentation |
| Feature components | Product, category, supplier, and inventory UI workflows |
| Common components | Reusable buttons, forms, tables, modals, badges, loading, and error states |
| API layer | Centralized frontend HTTP communication |
| FastAPI routes | HTTP endpoints, dependency injection, response handling |
| Pydantic schemas | Request validation and response serialization |
| CRUD layer | Database queries and inventory business rules |
| SQLAlchemy models | Database table and relationship definitions |
| MySQL | Persistent data storage |

---

## 3. Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | Component-based user interface |
| TypeScript | Static typing and safer API contracts |
| Vite | Development server, HMR, and production bundling |
| React Router | Client-side navigation without full-page reloads |
| Axios | REST API communication and centralized error interception |
| Tailwind CSS + custom CSS | Utility-first responsive styling with a restrained paper, ink, and coral visual system |
| React Context | Shared toast notification state |
| React Hooks | Local state, effects, debounce behavior, and memoization |

### Backend

| Technology | Purpose |
|---|---|
| Python 3.12 | Backend programming language |
| FastAPI | REST API framework |
| Pydantic | Request and response validation |
| SQLAlchemy | ORM and database access |
| MySQL | Relational database |
| PyMySQL | MySQL database driver |
| Uvicorn | ASGI development server |

### Development tools

- TypeScript compiler for frontend type checking
- Vite production build
- oxlint for frontend linting
- FastAPI interactive Swagger documentation
- PowerShell launcher script for starting both applications

---

## 4. Repository Structure

```text
inventory_management/
|
|-- backend/
|   |-- app/
|   |   `-- main.py              FastAPI app and route definitions
|   |-- crud.py                  Database and inventory business logic
|   |-- database.py              SQLAlchemy engine and session setup
|   |-- models.py                SQLAlchemy database models
|   |-- schemas.py               Pydantic request/response schemas
|   `-- requirements.txt         Backend dependencies
|
|-- frontend/
|   |-- src/
|   |   |-- api/                 Centralized REST API modules
|   |   |-- components/          Layout, common, and feature components
|   |   |-- context/             Shared React context
|   |   |-- hooks/               Reusable hooks
|   |   |-- pages/               Route-level pages
|   |   |-- types/               TypeScript API contracts
|   |   |-- utils/               Formatting and error helpers
|   |   |-- App.tsx              Application route table
|   |   |-- main.tsx             React bootstrap entry point
|   |   `-- index.css            Tailwind CSS entry point
|   |-- .env                     Frontend API configuration
|   |-- package.json             Frontend scripts and dependencies
|   `-- vite.config.ts           Vite configuration
|
|-- database/                    Database-related project files
|-- docs/                        Architecture and presentation documents
|-- run.ps1                      Starts backend and/or frontend
`-- .gitignore
```

---

## 5. Frontend Architecture

The frontend follows this flow:

```text
Route
  |
  v
Page component
  |
  v
Feature components
  |
  v
Common reusable components
  |
  v
Typed API functions
  |
  v
FastAPI REST endpoints
```

### Routes

| URL | Page | Responsibility |
|---|---|---|
| `/` | Dashboard | Summary statistics and recent inventory activity |
| `/products` | Products | Product CRUD, search, filters, and pagination |
| `/categories` | Categories | Category CRUD |
| `/suppliers` | Suppliers | Supplier CRUD |
| `/inventory` | Inventory | Stock movements and transaction history |

### Frontend folder responsibilities

#### `src/api/`

Contains domain-specific REST functions:

- `client.ts` creates the Axios client and normalizes FastAPI errors.
- `products.ts` handles product requests.
- `categories.ts` handles category requests.
- `suppliers.ts` handles supplier requests.
- `inventory.ts` handles stock and transaction requests.

Components do not construct API URLs directly.

#### `src/types/`

Contains TypeScript interfaces matching backend Pydantic schemas:

- `Product`
- `Category`
- `Supplier`
- `InventoryTransaction`
- Create and update request types
- Pagination response types

This keeps frontend and backend contracts explicit.

#### `src/components/common/`

Reusable components include:

- `Button`
- `Modal`
- `Input`
- `Select`
- `Table`
- `Badge`
- `Toast`
- `LoadingSpinner`
- `ConfirmationDialog`
- `Pagination`
- `EmptyState`
- `ErrorState`

#### `src/components/layout/`

- `Sidebar` provides navigation.
- `Topbar` displays the current page title.
- `AppLayout` combines the sidebar, topbar, page content, and toast notifications.

The latest visual design follows a minimalist system:

- Warm paper-toned application background
- Dark ink sidebar for clear navigation hierarchy
- Coral accent color for primary actions and active states
- Editorial serif headings paired with compact sans-serif interface text
- Thin borders and soft shadows instead of heavy cards
- Live workspace status indicator in the top navigation
- Responsive spacing and horizontal overflow behavior for smaller screens

#### `src/context/` and `src/hooks/`

- `ToastContext` stores active success, error, and information messages.
- `useToast` provides access to toast actions.
- `useDebounce` delays product search requests to avoid an API request for every keystroke.

---

## 6. Backend Architecture

The backend follows a layered FastAPI structure:

```text
HTTP Request
  |
  v
FastAPI route in app/main.py
  |
  v
Pydantic request validation
  |
  v
CRUD function in crud.py
  |
  v
SQLAlchemy query
  |
  v
MySQL
  |
  v
SQLAlchemy result
  |
  v
Pydantic response model
  |
  v
JSON response
```

### `backend/app/main.py`

Responsibilities:

- Creates the FastAPI application.
- Registers CORS middleware for the Vite development origins.
- Defines routes and HTTP methods.
- Injects SQLAlchemy sessions with `Depends(get_db)`.
- Converts missing resources into HTTP 404 responses.
- Converts insufficient stock into HTTP 400.
- Handles duplicate SKU conflicts with HTTP 409.

### `backend/schemas.py`

Defines Pydantic models for:

- Product creation and updates
- Category creation and updates
- Supplier creation and updates
- Inventory stock-in and stock-out requests
- Product pagination responses
- Inventory transaction responses

Inventory quantities use `Field(gt=0)` so zero and negative quantities are rejected with HTTP 422.

### `backend/crud.py`

Contains database and business operations:

- Product queries and CRUD
- Category queries and CRUD
- Supplier queries and CRUD
- Category get-or-create behavior during product creation
- Stock quantity calculations
- Inventory transaction creation
- Transaction filtering and newest-first ordering

The stock functions use `.with_for_update()` to lock the product row during stock changes.

### `backend/models.py`

Defines the SQLAlchemy tables and relationships:

- `Category`
- `Supplier`
- `Product`
- `InventoryTransaction`

### `backend/database.py`

Creates:

- MySQL connection URL
- SQLAlchemy engine
- `SessionLocal`
- Declarative model base

The database password is read from the environment using `DB_PASSWORD`.

---

## 7. Database Model

```text
categories
    |
    | one category has many products
    v
products <---------------- suppliers
    |
    | one product has many inventory transactions
    v
inventory_transactions
```

### Main tables

#### Categories

- `id`
- `name`
- `description`

The category name is unique.

#### Suppliers

- `id`
- `name`
- `email`
- `phone`
- `address`

#### Products

- `id`
- `product_name`
- `price`
- `quantity`
- `category_id`
- `supplier_id`
- `sku`
- `description`

The SKU is unique and category/supplier references are required.

#### Inventory transactions

- `id`
- `product_id`
- `transaction_type`
- `quantity`
- `previous_quantity`
- `new_quantity`
- `reference`
- `notes`
- `created_at`

Transactions represent audit history and do not have update or delete API endpoints.

---

## 8. API Data Flow

### Example: loading products

```text
Products page mounts
  |
  v
getProducts(params)
  |
  v
Axios GET /products?page=1&page_size=10
  |
  v
FastAPI validates query parameters
  |
  v
crud.get_products()
  |
  v
SQLAlchemy filters, counts, sorts, and paginates
  |
  v
ProductListResponse returned as JSON
  |
  v
React updates products, total, page, and total_pages state
  |
  v
ProductTable renders the result
```

### Example: creating a product

```text
User submits ProductForm
  |
  v
Frontend validates form values
  |
  v
createProduct(payload)
  |
  v
POST /products
  |
  v
FastAPI validates ProductCreate
  |
  v
CRUD validates supplier and resolves or creates category
  |
  v
SQLAlchemy inserts product
  |
  v
ProductResponse returned
  |
  v
Success toast displayed
  |
  v
Product list is refetched without a full-page reload
```

### Example: stock-in

```text
User submits Stock In modal
  |
  v
POST /inventory/stock-in
  |
  v
FastAPI validates quantity > 0
  |
  v
CRUD locks product row
  |
  v
previous_quantity is read
  |
  v
Product quantity is increased
  |
  v
InventoryTransaction is created
  |
  v
Transaction is committed
  |
  v
Frontend refreshes products and transactions
```

### Example: stock-out

```text
User submits Stock Out modal
  |
  v
CRUD locks product row
  |
  v
Available quantity is checked
  |
  +-- insufficient stock -> HTTP 400, no quantity change, no transaction
  |
  `-- sufficient stock -> quantity decreases and transaction is committed
```

---

## 9. Product Workflow

The product workflow supports creating a category directly inside the product form:

```text
Open Add Product
  |
  v
Select existing category OR select + Add New Category
  |
  v
Category modal opens
  |
  v
POST /categories
  |
  v
New category is added to the dropdown and auto-selected
  |
  v
Complete product details
  |
  v
POST /products
  |
  v
Product is created and positive initial quantity is recorded as opening STOCK_IN
  |
  v
Product list and inventory history refresh; success toast appears
```

The supplier field follows the same pattern:

```text
Open Add Product
  |
  v
Select + Add New Supplier
  |
  v
Supplier modal opens
  |
  v
POST /suppliers
  |
  v
New supplier is added to the dropdown and auto-selected
  |
  v
Continue completing the product form
```

The shared `SupplierFormModal` is reused by both the Suppliers page and the Product form. This avoids duplicating supplier validation and keeps supplier creation behavior consistent throughout the application.

Important product behaviors:

- Search checks product name and SKU.
- Filters can combine category, supplier, and search text.
- Pagination is performed by the backend.
- Price is returned as a numeric value even though the database uses a decimal type.
- SKU uniqueness is enforced by the database and handled by the API.
- A new category or supplier can be created without leaving the product form.
- A product created with a positive initial quantity creates an opening `STOCK_IN` transaction from `0` to the initial quantity.
- Products created with quantity `0` do not create a zero-quantity inventory transaction.

---

## 10. Inventory Workflow

The Inventory page provides:

- Stock In
- Stock Out
- Product filtering
- Transaction history
- Transaction type badges
- Previous and new quantity values
- Reference and notes fields
- Date formatting

After a successful inventory mutation:

1. A success toast is shown.
2. Product quantities are refetched.
3. Inventory transactions are refetched.
4. The UI updates without a browser refresh.

---

## 11. Validation and Error Handling

### Frontend validation

The frontend validates common errors before sending requests:

- Required product name
- Positive price
- Non-negative product quantity
- Required SKU
- Selected category
- Selected supplier
- Positive stock movement quantity

### Backend validation

FastAPI and Pydantic enforce the final contract:

- Missing required fields return HTTP 422.
- Invalid data types return HTTP 422.
- Stock quantity must be greater than zero.
- Missing resources return HTTP 404.
- Insufficient stock returns HTTP 400.
- Duplicate SKU returns HTTP 409.
- Invalid supplier returns HTTP 404.

### Frontend error display

Axios intercepts backend errors and extracts FastAPI's `detail` field. The frontend then displays the normalized message in a toast or page-level error state.

---

## 12. CORS and Environment Configuration

The frontend reads its API URL from:

```text
frontend/.env

VITE_API_BASE_URL=http://127.0.0.1:8000
```

The backend allows the Vite development origins:

```text
http://localhost:5173
http://127.0.0.1:5173
```

CORS is required because the frontend and backend run on different origins during development.

The frontend must be restarted after changing `.env` values because Vite loads environment variables when it starts.

---

## 13. Running the Project

### Start both applications with the PowerShell launcher

From the project root:

```powershell
.\run.ps1 -Backend -Frontend
```

### Start only the backend

```powershell
cd backend
python -m uvicorn app.main:app --reload
```

Backend URLs:

- API: `http://127.0.0.1:8000`
- Swagger: `http://127.0.0.1:8000/docs`

### Start only the frontend

```powershell
cd frontend
npm run dev
```

Frontend URL:

- `http://localhost:5173`

### Frontend validation commands

```powershell
cd frontend
npm run build
npm run lint
```

`npm run build` runs TypeScript compilation and the Vite production build.

---

## 14. Testing Approach

The backend APIs were tested in logical order:

1. Root health endpoint
2. Categories
3. Suppliers
4. Products
5. Product search and filters
6. Stock-in
7. Stock-out
8. Insufficient stock
9. Inventory transactions
10. Transaction lookup
11. Validation cases
12. Temporary data cleanup

The frontend was verified through the browser for:

- Dashboard data loading
- Products list loading
- Product search and filters
- Add Product modal
- Inline Add Category flow
- Inline Add Supplier flow
- Product creation and refresh
- Category CRUD screens
- Supplier CRUD screens
- Stock-in modal
- Transaction history refresh
- Toast notifications
- Loading and empty states
- Responsive layout structure
- Minimalist theme rendering across the application shell, dashboard, tables, forms, and buttons

---

## 15. Important Technical Decisions

### Centralized API layer

Only the API modules communicate with Axios. This prevents duplicated URLs, headers, and error parsing logic throughout the UI.

### TypeScript API contracts

Frontend interfaces match backend Pydantic models. This provides an early warning if a response or request shape changes.

### Refetch after mutation

After create, update, delete, stock-in, or stock-out operations, the affected data is refetched. This is simple, predictable, and appropriate for the current application size.

### Reusable UI components

Shared components ensure buttons, forms, tables, dialogs, loading states, and errors look and behave consistently across features.

### Minimalist visual system

The latest UI pass keeps the existing workflows but gives the application a consistent visual identity. The shared stylesheet defines CSS variables for ink, muted text, paper background, panel color, borders, and coral accent color. Layout components use these variables for the sidebar, topbar, status chip, dashboard cards, table headers, form controls, and focus states.

This keeps styling centralized and makes future theme adjustments possible without changing business logic or API code.

### Immutable transaction history

Inventory transactions are treated as audit records. The API intentionally exposes creation and retrieval but no update or delete operations.

### Database row locking

Stock changes use `with_for_update()` to reduce race conditions when multiple operations attempt to update the same product quantity.

---

## 16. Known Limitations and Future Improvements

These are not currently implemented features, but they are useful discussion points for future phases:

- Authentication and authorization are not implemented.
- There is no role-based access control.
- Product deletion can conflict with existing inventory transaction foreign keys.
- Large product catalogs may need server-side dashboard aggregation instead of fetching a large page.
- Automated frontend component tests could be added.
- Automated end-to-end browser tests could be added.
- Database migrations could be managed with Alembic.
- Production deployment would need HTTPS, environment-specific configuration, logging, monitoring, and a production server setup.

The current implementation deliberately stays within the requested scope.

---

## 17. Presentation Talking Points

A concise presentation narrative can follow this order:

1. **Problem:** Inventory teams need one place to manage products, suppliers, categories, and stock movement history.
2. **Solution:** A React dashboard communicates with a FastAPI REST backend backed by MySQL.
3. **Architecture:** The frontend is componentized and typed; the backend separates routes, validation, CRUD logic, and persistence.
4. **User workflow:** Users manage catalog data, then record stock-in and stock-out movements.
5. **Data integrity:** Pydantic validation, foreign keys, unique SKUs, transactions, and row locking protect the data.
6. **User experience:** Loading states, empty states, errors, confirmation dialogs, toasts, filtering, pagination, and responsive layouts are included.
7. **Visual design:** The minimalist theme provides a focused workspace with clear navigation, restrained color, readable hierarchy, responsive tables, and visible system status.
8. **Testing:** Core API flows and live frontend workflows were tested against the running services, including inline category and supplier creation.
9. **Future scope:** Authentication, production deployment, migrations, automated tests, and soft deletion can be added later.

### Suggested closing statement

> The project provides a focused, typed, and maintainable foundation for inventory operations. The frontend handles user workflows and presentation, while the backend owns validation, business rules, transaction safety, and database persistence.
