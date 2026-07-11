using Server.Models;

namespace Server.Data;

// Стартовые данные демо-магазина: перенесены из src/api/mock/mockData.ts,
// чтобы каталог на реальном бэкенде совпадал с прежним мок-каталогом.
public static class SeedData
{
    public static readonly (string Id, string Key, string Name)[] Categories =
    {
        ("cat-fruits", "fruits", "Fruits"),
        ("cat-vegetables", "vegetables", "Vegetables"),
        ("cat-nuts", "nuts", "Nuts & Grains"),
        ("cat-drinks", "drinks", "Drinks"),
        ("cat-ready", "ready-to-eat", "Ready-to-eat"),
    };

    // name, categoryId, centAmount, discountedCentAmount (0 = нет скидки), description
    public static readonly (string Name, string Cat, int Cent, int Disc, string Desc)[] Products =
    {
        ("Avocado", "cat-fruits", 350, 0, "Ripe Hass avocado, rich in healthy fats and vitamins."),
        ("Blueberry", "cat-fruits", 590, 0, "Fresh organic blueberries, packed with antioxidants."),
        ("Mango", "cat-fruits", 420, 0, "Sweet and juicy mango, perfect for smoothies and salads."),
        ("Kiwi", "cat-fruits", 280, 0, "Tangy green kiwi, an excellent source of vitamin C."),
        ("Lemon", "cat-fruits", 190, 0, "Zesty lemons for cooking, baking and refreshing drinks."),
        ("Broccoli", "cat-vegetables", 310, 0, "Crisp green broccoli, steamed or roasted in minutes."),
        ("Spinach", "cat-vegetables", 250, 0, "Tender baby spinach leaves, great for salads and stews."),
        ("Carrot", "cat-vegetables", 180, 0, "Sweet crunchy carrots, full of beta-carotene."),
        ("Almonds", "cat-nuts", 890, 0, "Raw whole almonds, a wholesome protein-rich snack."),
        ("Tea", "cat-drinks", 450, 0, "Loose-leaf green tea with a delicate fresh aroma."),
        ("Strawberry", "cat-fruits", 650, 520, "Sun-ripened strawberries, sweet and fragrant."),
        ("Orange", "cat-fruits", 320, 240, "Juicy oranges bursting with vitamin C."),
        ("Tomatoes", "cat-vegetables", 380, 290, "Vine-ripened tomatoes with a rich garden flavour."),
        ("Walnuts", "cat-nuts", 990, 790, "Shelled walnuts, a natural source of omega-3."),
        ("Oatmeal", "cat-nuts", 340, 260, "Whole-grain rolled oats for a hearty breakfast."),
        ("Smoothie", "cat-ready", 550, 440, "Cold-pressed berry smoothie with no added sugar."),
        ("Potato", "cat-vegetables", 120, 0, "A kitchen classic with endless possibilities."),
        ("Bread", "cat-ready", 470, 0, "Fresh tasty bread."),
        ("Juice", "cat-drinks", 430, 0, "From nature's garden to your morning glass."),
        ("Watermelon", "cat-fruits", 870, 0, "Crisp, refreshing, and naturally sweet. Every slice tastes like sunshine."),
        ("Cherry", "cat-fruits", 310, 0, "Tiny fruit, big personality."),
        ("Cookies", "cat-ready", 730, 0, "Crispy edges, soft center, pure happiness."),
        ("Apples", "cat-fruits", 280, 0, "Fresh from the orchard, packed with goodness."),
        ("Macadamia", "cat-nuts", 980, 0, "Smooth, creamy, and naturally luxurious."),
    };

    // Демо-пользователи: у админа стоит IsAdmin — он входит в CMS.
    public static readonly (string Email, string Pass, string First, string Last, string Dob, bool Admin)[] Users =
    {
        ("admin@demo.com", "Admin123!", "Admin", "Demo", "1990-01-01", true),
        ("user@demo.com", "User123!", "Uma", "User", "1995-05-05", false),
    };

    public static void Seed(AppDbContext db)
    {
        if (db.Categories.Any()) return; // уже засеяно

        var now = DateTime.UtcNow;

        foreach (var (id, key, name) in Categories)
            db.Categories.Add(new Category { Id = id, Key = key, NameEn = name, OrderHint = Array.IndexOf(Categories, (id, key, name)) });

        var index = 0;
        foreach (var (name, cat, cent, disc, desc) in Products)
        {
            var slug = name.ToLowerInvariant();
            var product = new Product
            {
                Id = $"prod-{slug}",
                NameEn = name,
                Slug = slug,
                DescriptionEn = desc,
                CategoryId = cat,
                CentAmount = cent,
                DiscountedCentAmount = disc == 0 ? null : disc,
                CreatedAt = now,
                LastModifiedAt = now,
            };
            // Ровно 2 картинки на товар — как в прежнем моке
            product.Images.Add(new ProductImage { Url = $"./images/products/{slug}-1.jpg", Ord = 0 });
            product.Images.Add(new ProductImage { Url = $"./images/products/{slug}-2.jpg", Ord = 1 });
            db.Products.Add(product);
            index++;
        }

        var demoAddress = () => new Address
        {
            Country = "DE",
            City = "Berlin",
            StreetName = "Alexanderplatz 1",
            PostalCode = "10178",
        };

        foreach (var (email, pass, first, last, dob, admin) in Users)
        {
            var billing = demoAddress();
            billing.Id = Guid.NewGuid().ToString();
            billing.IsBilling = true;
            billing.IsDefaultBilling = true;

            var shipping = demoAddress();
            shipping.Id = Guid.NewGuid().ToString();
            shipping.IsShipping = true;
            shipping.IsDefaultShipping = true;

            db.Customers.Add(new Customer
            {
                Id = Guid.NewGuid().ToString(),
                Email = email,
                Password = pass,
                FirstName = first,
                LastName = last,
                DateOfBirth = dob,
                IsAdmin = admin,
                Addresses = { billing, shipping },
            });
        }

        db.SaveChanges();
    }
}
