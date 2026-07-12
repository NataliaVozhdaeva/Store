IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260712051850_InitialCreate'
)
BEGIN
    CREATE TABLE [Carts] (
        [Id] nvarchar(450) NOT NULL,
        [CustomerId] nvarchar(max) NULL,
        [DiscountCode] nvarchar(max) NULL,
        [Version] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [LastModifiedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Carts] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260712051850_InitialCreate'
)
BEGIN
    CREATE TABLE [Categories] (
        [Id] nvarchar(450) NOT NULL,
        [Key] nvarchar(max) NOT NULL,
        [NameEn] nvarchar(max) NOT NULL,
        [OrderHint] int NOT NULL,
        CONSTRAINT [PK_Categories] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260712051850_InitialCreate'
)
BEGIN
    CREATE TABLE [Customers] (
        [Id] nvarchar(450) NOT NULL,
        [Email] nvarchar(450) NOT NULL,
        [Password] nvarchar(max) NOT NULL,
        [FirstName] nvarchar(max) NULL,
        [LastName] nvarchar(max) NULL,
        [DateOfBirth] nvarchar(max) NULL,
        [IsAdmin] bit NOT NULL,
        [Version] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [LastModifiedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Customers] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260712051850_InitialCreate'
)
BEGIN
    CREATE TABLE [Products] (
        [Id] nvarchar(450) NOT NULL,
        [NameEn] nvarchar(max) NOT NULL,
        [Slug] nvarchar(max) NOT NULL,
        [DescriptionEn] nvarchar(max) NOT NULL,
        [CategoryId] nvarchar(450) NOT NULL,
        [CentAmount] int NOT NULL,
        [DiscountedCentAmount] int NULL,
        [Version] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [LastModifiedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Products] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Products_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Categories] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260712051850_InitialCreate'
)
BEGIN
    CREATE TABLE [Addresses] (
        [Id] nvarchar(450) NOT NULL,
        [CustomerId] nvarchar(450) NOT NULL,
        [StreetName] nvarchar(max) NULL,
        [City] nvarchar(max) NULL,
        [State] nvarchar(max) NULL,
        [Country] nvarchar(max) NOT NULL,
        [PostalCode] nvarchar(max) NULL,
        [IsBilling] bit NOT NULL,
        [IsShipping] bit NOT NULL,
        [IsDefaultBilling] bit NOT NULL,
        [IsDefaultShipping] bit NOT NULL,
        CONSTRAINT [PK_Addresses] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Addresses_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260712051850_InitialCreate'
)
BEGIN
    CREATE TABLE [LineItems] (
        [Id] nvarchar(450) NOT NULL,
        [CartId] nvarchar(450) NOT NULL,
        [ProductId] nvarchar(450) NOT NULL,
        [Quantity] int NOT NULL,
        CONSTRAINT [PK_LineItems] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_LineItems_Carts_CartId] FOREIGN KEY ([CartId]) REFERENCES [Carts] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_LineItems_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260712051850_InitialCreate'
)
BEGIN
    CREATE TABLE [ProductImages] (
        [Id] int NOT NULL IDENTITY,
        [ProductId] nvarchar(450) NOT NULL,
        [Url] nvarchar(max) NOT NULL,
        [Ord] int NOT NULL,
        CONSTRAINT [PK_ProductImages] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ProductImages_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260712051850_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Addresses_CustomerId] ON [Addresses] ([CustomerId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260712051850_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Customers_Email] ON [Customers] ([Email]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260712051850_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_LineItems_CartId] ON [LineItems] ([CartId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260712051850_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_LineItems_ProductId] ON [LineItems] ([ProductId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260712051850_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ProductImages_ProductId] ON [ProductImages] ([ProductId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260712051850_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Products_CategoryId] ON [Products] ([CategoryId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260712051850_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260712051850_InitialCreate', N'8.0.28');
END;
GO

COMMIT;
GO

