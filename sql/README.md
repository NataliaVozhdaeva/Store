# SQL scripts (Azure SQL Database)

Scripts are written in T-SQL for **Azure SQL Database** (Microsoft SQL Server dialect).
`01-create-database.sql` is generated from the Entity Framework Core model
(`server/Data/AppDbContext.cs`), so schema and code cannot drift apart.

| File | Purpose |
| --- | --- |
| `01-create-database.sql` | Creates all tables, indexes and foreign keys. Idempotent — safe to re-run. |
| `02-insert-sample-data.sql` | Inserts the sample catalog and demo users. Skips itself if data is already present. |

## How to run

1. In the Azure Portal create an **SQL database** (e.g. `OrganickDb`) on an SQL server.
2. Open **Query editor (preview)** for that database, or connect with Azure Data Studio / SSMS.
3. Run `01-create-database.sql`, then `02-insert-sample-data.sql`.

The last statement of the second script prints the row counts, expected result:

| Categories | Products | ProductImages | Customers | Addresses |
| --- | --- | --- | --- | --- |
| 5 | 24 | 48 | 2 | 4 |

## Demo accounts

| Email | Password | Role |
| --- | --- | --- |
| `admin@demo.com` | `Admin123!` | Admin — sees the CMS (`#admin`) and can add / edit / delete products |
| `user@demo.com` | `User123!` | Regular customer |

## Pointing the application at the cloud database

The API picks its database provider from configuration, no code change is needed.
On Azure App Service set:

- `DatabaseProvider` = `SqlServer`
- `ConnectionStrings__DefaultConnection` = the ADO.NET connection string of the Azure SQL database

Locally the defaults in `server/appsettings.json` (`Sqlite` + `app.db`) are used instead.

## Regenerating the create script

```bash
cd server
dotnet ef migrations script --idempotent -o ../sql/01-create-database.sql
```
