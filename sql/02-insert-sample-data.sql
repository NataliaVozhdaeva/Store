/* Organick eCommerce - sample data for Azure SQL Database (T-SQL) */
/* Run AFTER 01-create-database.sql. Safe to re-run: skips if data already present. */

SET NOCOUNT ON;

IF EXISTS (SELECT 1 FROM [Categories])
BEGIN
    PRINT 'Sample data already present - nothing inserted.';
END
ELSE
BEGIN
    DECLARE @now datetime2 = SYSUTCDATETIME();

    BEGIN TRANSACTION;

    /* ---------- Categories ---------- */
    INSERT INTO [Categories] ([Id], [Key], [NameEn], [OrderHint]) VALUES
        (N'cat-fruits', N'fruits', N'Fruits', 0),
        (N'cat-vegetables', N'vegetables', N'Vegetables', 1),
        (N'cat-nuts', N'nuts', N'Nuts & Grains', 2),
        (N'cat-drinks', N'drinks', N'Drinks', 3),
        (N'cat-ready', N'ready-to-eat', N'Ready-to-eat', 4);

    /* ---------- Products (prices are stored in cents) ---------- */
    INSERT INTO [Products] ([Id], [NameEn], [Slug], [DescriptionEn], [CategoryId], [CentAmount], [DiscountedCentAmount], [Version], [CreatedAt], [LastModifiedAt]) VALUES
        (N'prod-avocado', N'Avocado', N'avocado', N'Ripe Hass avocado, rich in healthy fats and vitamins.', N'cat-fruits', 350, NULL, 1, @now, @now),
        (N'prod-blueberry', N'Blueberry', N'blueberry', N'Fresh organic blueberries, packed with antioxidants.', N'cat-fruits', 590, NULL, 1, @now, @now),
        (N'prod-mango', N'Mango', N'mango', N'Sweet and juicy mango, perfect for smoothies and salads.', N'cat-fruits', 420, NULL, 1, @now, @now),
        (N'prod-kiwi', N'Kiwi', N'kiwi', N'Tangy green kiwi, an excellent source of vitamin C.', N'cat-fruits', 280, NULL, 1, @now, @now),
        (N'prod-lemon', N'Lemon', N'lemon', N'Zesty lemons for cooking, baking and refreshing drinks.', N'cat-fruits', 190, NULL, 1, @now, @now),
        (N'prod-broccoli', N'Broccoli', N'broccoli', N'Crisp green broccoli, steamed or roasted in minutes.', N'cat-vegetables', 310, NULL, 1, @now, @now),
        (N'prod-spinach', N'Spinach', N'spinach', N'Tender baby spinach leaves, great for salads and stews.', N'cat-vegetables', 250, NULL, 1, @now, @now),
        (N'prod-carrot', N'Carrot', N'carrot', N'Sweet crunchy carrots, full of beta-carotene.', N'cat-vegetables', 180, NULL, 1, @now, @now),
        (N'prod-almonds', N'Almonds', N'almonds', N'Raw whole almonds, a wholesome protein-rich snack.', N'cat-nuts', 890, NULL, 1, @now, @now),
        (N'prod-tea', N'Tea', N'tea', N'Loose-leaf green tea with a delicate fresh aroma.', N'cat-drinks', 450, NULL, 1, @now, @now),
        (N'prod-strawberry', N'Strawberry', N'strawberry', N'Sun-ripened strawberries, sweet and fragrant.', N'cat-fruits', 650, 520, 1, @now, @now),
        (N'prod-orange', N'Orange', N'orange', N'Juicy oranges bursting with vitamin C.', N'cat-fruits', 320, 240, 1, @now, @now),
        (N'prod-tomatoes', N'Tomatoes', N'tomatoes', N'Vine-ripened tomatoes with a rich garden flavour.', N'cat-vegetables', 380, 290, 1, @now, @now),
        (N'prod-walnuts', N'Walnuts', N'walnuts', N'Shelled walnuts, a natural source of omega-3.', N'cat-nuts', 990, 790, 1, @now, @now),
        (N'prod-oatmeal', N'Oatmeal', N'oatmeal', N'Whole-grain rolled oats for a hearty breakfast.', N'cat-nuts', 340, 260, 1, @now, @now),
        (N'prod-smoothie', N'Smoothie', N'smoothie', N'Cold-pressed berry smoothie with no added sugar.', N'cat-ready', 550, 440, 1, @now, @now),
        (N'prod-potato', N'Potato', N'potato', N'A kitchen classic with endless possibilities.', N'cat-vegetables', 120, NULL, 1, @now, @now),
        (N'prod-bread', N'Bread', N'bread', N'Fresh tasty bread.', N'cat-ready', 470, NULL, 1, @now, @now),
        (N'prod-juice', N'Juice', N'juice', N'From nature''s garden to your morning glass.', N'cat-drinks', 430, NULL, 1, @now, @now),
        (N'prod-watermelon', N'Watermelon', N'watermelon', N'Crisp, refreshing, and naturally sweet. Every slice tastes like sunshine.', N'cat-fruits', 870, NULL, 1, @now, @now),
        (N'prod-cherry', N'Cherry', N'cherry', N'Tiny fruit, big personality.', N'cat-fruits', 310, NULL, 1, @now, @now),
        (N'prod-cookies', N'Cookies', N'cookies', N'Crispy edges, soft center, pure happiness.', N'cat-ready', 730, NULL, 1, @now, @now),
        (N'prod-apples', N'Apples', N'apples', N'Fresh from the orchard, packed with goodness.', N'cat-fruits', 280, NULL, 1, @now, @now),
        (N'prod-macadamia', N'Macadamia', N'macadamia', N'Smooth, creamy, and naturally luxurious.', N'cat-nuts', 980, NULL, 1, @now, @now);

    /* ---------- Product images: 2 per product, [Id] is IDENTITY ---------- */
    INSERT INTO [ProductImages] ([ProductId], [Url], [Ord]) VALUES
        (N'prod-avocado', N'./images/products/avocado-1.jpg', 0),
        (N'prod-avocado', N'./images/products/avocado-2.jpg', 1),
        (N'prod-blueberry', N'./images/products/blueberry-1.jpg', 0),
        (N'prod-blueberry', N'./images/products/blueberry-2.jpg', 1),
        (N'prod-mango', N'./images/products/mango-1.jpg', 0),
        (N'prod-mango', N'./images/products/mango-2.jpg', 1),
        (N'prod-kiwi', N'./images/products/kiwi-1.jpg', 0),
        (N'prod-kiwi', N'./images/products/kiwi-2.jpg', 1),
        (N'prod-lemon', N'./images/products/lemon-1.jpg', 0),
        (N'prod-lemon', N'./images/products/lemon-2.jpg', 1),
        (N'prod-broccoli', N'./images/products/broccoli-1.jpg', 0),
        (N'prod-broccoli', N'./images/products/broccoli-2.jpg', 1),
        (N'prod-spinach', N'./images/products/spinach-1.jpg', 0),
        (N'prod-spinach', N'./images/products/spinach-2.jpg', 1),
        (N'prod-carrot', N'./images/products/carrot-1.jpg', 0),
        (N'prod-carrot', N'./images/products/carrot-2.jpg', 1),
        (N'prod-almonds', N'./images/products/almonds-1.jpg', 0),
        (N'prod-almonds', N'./images/products/almonds-2.jpg', 1),
        (N'prod-tea', N'./images/products/tea-1.jpg', 0),
        (N'prod-tea', N'./images/products/tea-2.jpg', 1),
        (N'prod-strawberry', N'./images/products/strawberry-1.jpg', 0),
        (N'prod-strawberry', N'./images/products/strawberry-2.jpg', 1),
        (N'prod-orange', N'./images/products/orange-1.jpg', 0),
        (N'prod-orange', N'./images/products/orange-2.jpg', 1),
        (N'prod-tomatoes', N'./images/products/tomatoes-1.jpg', 0),
        (N'prod-tomatoes', N'./images/products/tomatoes-2.jpg', 1),
        (N'prod-walnuts', N'./images/products/walnuts-1.jpg', 0),
        (N'prod-walnuts', N'./images/products/walnuts-2.jpg', 1),
        (N'prod-oatmeal', N'./images/products/oatmeal-1.jpg', 0),
        (N'prod-oatmeal', N'./images/products/oatmeal-2.jpg', 1),
        (N'prod-smoothie', N'./images/products/smoothie-1.jpg', 0),
        (N'prod-smoothie', N'./images/products/smoothie-2.jpg', 1),
        (N'prod-potato', N'./images/products/potato-1.jpg', 0),
        (N'prod-potato', N'./images/products/potato-2.jpg', 1),
        (N'prod-bread', N'./images/products/bread-1.jpg', 0),
        (N'prod-bread', N'./images/products/bread-2.jpg', 1),
        (N'prod-juice', N'./images/products/juice-1.jpg', 0),
        (N'prod-juice', N'./images/products/juice-2.jpg', 1),
        (N'prod-watermelon', N'./images/products/watermelon-1.jpg', 0),
        (N'prod-watermelon', N'./images/products/watermelon-2.jpg', 1),
        (N'prod-cherry', N'./images/products/cherry-1.jpg', 0),
        (N'prod-cherry', N'./images/products/cherry-2.jpg', 1),
        (N'prod-cookies', N'./images/products/cookies-1.jpg', 0),
        (N'prod-cookies', N'./images/products/cookies-2.jpg', 1),
        (N'prod-apples', N'./images/products/apples-1.jpg', 0),
        (N'prod-apples', N'./images/products/apples-2.jpg', 1),
        (N'prod-macadamia', N'./images/products/macadamia-1.jpg', 0),
        (N'prod-macadamia', N'./images/products/macadamia-2.jpg', 1);

    /* ---------- Demo customers ---------- */
    /* admin@demo.com / Admin123!  -> CMS access (IsAdmin = 1) */
    /* user@demo.com  / User123!   -> regular shopper        */
    INSERT INTO [Customers] ([Id], [Email], [Password], [FirstName], [LastName], [DateOfBirth], [IsAdmin], [Version], [CreatedAt], [LastModifiedAt]) VALUES
        (N'11111111-1111-1111-1111-111111111111', N'admin@demo.com', N'Admin123!', N'Admin', N'Demo', N'1990-01-01', 1, 1, @now, @now),
        (N'22222222-2222-2222-2222-222222222222', N'user@demo.com', N'User123!', N'Uma', N'User', N'1995-05-05', 0, 1, @now, @now);

    /* ---------- Demo addresses: one billing + one shipping per customer ---------- */
    INSERT INTO [Addresses] ([Id], [CustomerId], [StreetName], [City], [State], [Country], [PostalCode], [IsBilling], [IsShipping], [IsDefaultBilling], [IsDefaultShipping]) VALUES
        (N'aaaa1111-0000-0000-0000-000000000001', N'11111111-1111-1111-1111-111111111111', N'Alexanderplatz 1', N'Berlin', NULL, N'DE', N'10178', 1, 0, 1, 0),
        (N'aaaa1111-0000-0000-0000-000000000002', N'11111111-1111-1111-1111-111111111111', N'Alexanderplatz 1', N'Berlin', NULL, N'DE', N'10178', 0, 1, 0, 1),
        (N'bbbb2222-0000-0000-0000-000000000001', N'22222222-2222-2222-2222-222222222222', N'Alexanderplatz 1', N'Berlin', NULL, N'DE', N'10178', 1, 0, 1, 0),
        (N'bbbb2222-0000-0000-0000-000000000002', N'22222222-2222-2222-2222-222222222222', N'Alexanderplatz 1', N'Berlin', NULL, N'DE', N'10178', 0, 1, 0, 1);

    COMMIT;
END;
GO

SELECT (SELECT COUNT(*) FROM [Categories])    AS Categories,
       (SELECT COUNT(*) FROM [Products])      AS Products,
       (SELECT COUNT(*) FROM [ProductImages]) AS ProductImages,
       (SELECT COUNT(*) FROM [Customers])     AS Customers,
       (SELECT COUNT(*) FROM [Addresses])     AS Addresses;
GO
