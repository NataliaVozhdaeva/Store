# eCommerce-Application

A single-page e-commerce application that simulates a modern online shopping experience in a digital environment convenience_store. 
It's a comprehensive online shopping portal that provides an interactive and seamless experience to users. 
From product discovery to checkout, the application ensures a smooth journey for the user, enhancing their engagement and boosting their purchasing confidence.

Users can browse through a range of products, view detailed descriptions, add their favorite items to the basket, and proceed to checkout. 
It includes features such as user registration and login, product search, product categorization, and sorting to make the shopping experience more streamlined and convenient.

The application is a full-stack one: a TypeScript single-page front end, an ASP.NET Core REST API, and a cloud database. 
All data is fetched from and written to the database — nothing is stored in the browser except the current session.

Application consist from:

- Login and Registration pages;
- Main page;
- Catalog Product page;
- Detailed Product page;
- User Profile page;
- Cart page;
- About Us page;
- Admin page (content management system, visible to administrators only).

SPA has a liquid layout and looks great on various devices with a minimum resolution of 390px.

## Stack

### Front end (`src/`)

- TypeScript;
- REST API;
- AJAX;
- SCSS;
- Material UI;
- Webpack;
- Eslint;
- Prettier;
- Swiper;
- Husky;
- Jest.

### Back end (`server/`)

- ASP.NET Core 8 Web API;
- C#;
- Entity Framework Core 8 (code-first);
- Azure SQL Database in the cloud, SQLite when running locally.

## Content management system

An administrator logs in with an admin account and gets an **Admin** link in the navigation.
The page at `#admin` manages the products on sale — create, read, update and delete:

| Operation | Endpoint |
| --- | --- |
| Create | `POST /api/products` |
| Read | `GET /api/products`, `GET /api/products/{id}` |
| Update | `PUT /api/products/{id}` |
| Delete | `DELETE /api/products/{id}` |

Deleting a product that is still sitting in a customer's cart is rejected with `409 Conflict`.

The API also exposes categories (`/api/categories`), carts (`/api/carts`) and customers
(`/api/customers`) — registration, login, profile and address management.

## Database

The schema is defined by the Entity Framework Core model in `server/Models/`, so the C#
classes and the database tables cannot drift apart. Tables: `Categories`, `Products`,
`ProductImages`, `Customers`, `Addresses`, `Carts`, `LineItems`.

Ready-to-run T-SQL scripts for the cloud database live in `sql/`:

| File | Purpose |
| --- | --- |
| `sql/01-create-database.sql` | Creates all tables, indexes and foreign keys. |
| `sql/02-insert-sample-data.sql` | Inserts the sample catalog (5 categories, 24 products) and the demo users. |

Run `01` first, then `02`. Details in [`sql/README.md`](sql/README.md).

The database provider is chosen by configuration, so the same code runs locally and in the cloud:

| Setting | Local | Cloud |
| --- | --- | --- |
| `DatabaseProvider` | `Sqlite` | `SqlServer` |
| `ConnectionStrings__DefaultConnection` | `Data Source=app.db` | Azure SQL connection string |

Locally the defaults from `server/appsettings.json` are used. On Azure App Service the two
values are set as application settings.

## Demo accounts

| Email | Password | Role |
| --- | --- | --- |
| `admin@demo.com` | `Admin123!` | Administrator — has access to the CMS |
| `user@demo.com` | `User123!` | Customer |

## Setup

1. Clone this repo:
   <code>git clone git@github.com:NataliaVozhdaeva/Store.git</code>

2. Install front-end dependencies:
   <code>npm install</code>

3. Install the [.NET 8 SDK](https://dotnet.microsoft.com/download) for the back end.

## Running the application

### Everything at once

```bash
npm run build      # builds the SPA into dist/
cd server
dotnet run         # http://localhost:5000
```

The API serves the built front end as well, so the whole application is available at
`http://localhost:5000`. On the first start it creates a local SQLite database and fills
it with the same sample data as the SQL script.

### Front-end development

```bash
cd server && dotnet run     # API on port 5000
npm run dev                 # SPA on port 4000, proxies /api to the API
```

## Scripts

- <code>npm run test</code> to run Jest;
- <code>npm run dev</code> to run development mode;
- <code>npm run build</code> to build project;
- <code>npm run lint</code> to run linter;
- <code>npm run lint:fix</code> to fix code with linter;
- <code>npm run prettier</code> to run prettier;
- <code>npm run prepare</code> to run Husky.
