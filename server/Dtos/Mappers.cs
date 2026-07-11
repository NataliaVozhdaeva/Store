using Server.Models;

namespace Server.Dtos;

// Превращает чистые EF-сущности в JSON той формы, которую уже ожидает фронтенд
// (структуры commercetools SDK: ProductProjection, Category, Cart, Customer).
// Благодаря этому страницы приложения не меняются — переписывается только apiMethods.ts.
public static class Mappers
{
    private const string Currency = "EUR";
    public const string DiscountCode = "FALL23";
    public const string DiscountCodeId = "dc-fall23";
    private const double DiscountRate = 0.1; // скидка 10%

    private static object Money(int centAmount) => new
    {
        type = "centPrecision",
        currencyCode = Currency,
        centAmount,
        fractionDigits = 2,
    };

    // Цена товара: базовая + опциональная скидка (как price в commercetools)
    private static object Price(Product p) => new
    {
        id = $"price-{p.Id}",
        value = Money(p.CentAmount),
        discounted = p.DiscountedCentAmount is int d
            ? new
            {
                value = Money(d),
                discount = new { typeId = "product-discount", id = "pd-autumn-sale" },
            }
            : null,
    };

    private static object Images(Product p) => p.Images
        .OrderBy(i => i.Ord)
        .Select(i => new { url = i.Url, dimensions = new { w = 600, h = 600 } })
        .ToArray();

    // Цена за единицу с учётом возможной скидки
    private static int Unit(Product p) => p.DiscountedCentAmount ?? p.CentAmount;

    public static object Product(Product p) => new
    {
        id = p.Id,
        version = p.Version,
        createdAt = p.CreatedAt,
        lastModifiedAt = p.LastModifiedAt,
        productType = new { typeId = "product-type", id = "pt-food" },
        name = new { en = p.NameEn },
        slug = new { en = p.Slug },
        description = new { en = p.DescriptionEn },
        categories = new[] { new { typeId = "category", id = p.CategoryId } },
        masterVariant = new
        {
            id = 1,
            images = Images(p),
            prices = new[] { Price(p) },
        },
        variants = Array.Empty<object>(),
        searchKeywords = new { },
    };

    public static object Category(Category c) => new
    {
        id = c.Id,
        key = c.Key,
        version = 1,
        createdAt = DateTime.UnixEpoch,
        lastModifiedAt = DateTime.UnixEpoch,
        name = new { en = c.NameEn },
        slug = new { en = c.Key },
        orderHint = c.OrderHint.ToString(),
        ancestors = Array.Empty<object>(),
    };

    // Обёртка «постраничный ответ» commercetools
    public static object Paged(IEnumerable<object> results)
    {
        var list = results.ToArray();
        return new
        {
            limit = 100,
            offset = 0,
            count = list.Length,
            total = list.Length,
            results = list,
        };
    }

    private static object LineItem(LineItem li) => new
    {
        id = li.Id,
        productId = li.ProductId,
        name = new { en = li.Product.NameEn },
        productType = new { typeId = "product-type", id = "pt-food" },
        productSlug = new { en = li.Product.Slug },
        price = Price(li.Product),
        quantity = li.Quantity,
        variant = new { id = 1, images = Images(li.Product) },
        totalPrice = Money(Unit(li.Product) * li.Quantity),
    };

    public static object Cart(Cart cart)
    {
        var subtotal = cart.LineItems.Sum(li => Unit(li.Product) * li.Quantity);
        var hasPromo = !string.IsNullOrEmpty(cart.DiscountCode);
        var total = hasPromo ? (int)Math.Round(subtotal * (1 - DiscountRate)) : subtotal;

        return new
        {
            id = cart.Id,
            version = cart.Version,
            createdAt = cart.CreatedAt,
            lastModifiedAt = cart.LastModifiedAt,
            customerId = cart.CustomerId,
            lineItems = cart.LineItems.Select(LineItem).ToArray(),
            totalPrice = Money(total),
            discountCodes = hasPromo
                ? new[]
                {
                    new
                    {
                        discountCode = new { typeId = "discount-code", id = DiscountCodeId },
                        state = "MatchesCart",
                    },
                }
                : Array.Empty<object>(),
            cartState = "Active",
        };
    }

    public static object Customer(Customer c) => new
    {
        id = c.Id,
        version = c.Version,
        createdAt = c.CreatedAt,
        lastModifiedAt = c.LastModifiedAt,
        email = c.Email,
        firstName = c.FirstName,
        lastName = c.LastName,
        dateOfBirth = c.DateOfBirth,
        isAdmin = c.IsAdmin,
        addresses = c.Addresses.Select(a => new
        {
            id = a.Id,
            streetName = a.StreetName,
            city = a.City,
            state = a.State,
            country = a.Country,
            postalCode = a.PostalCode,
        }).ToArray(),
        billingAddressIds = c.Addresses.Where(a => a.IsBilling).Select(a => a.Id).ToArray(),
        shippingAddressIds = c.Addresses.Where(a => a.IsShipping).Select(a => a.Id).ToArray(),
        defaultBillingAddressId = c.Addresses.FirstOrDefault(a => a.IsDefaultBilling)?.Id,
        defaultShippingAddressId = c.Addresses.FirstOrDefault(a => a.IsDefaultShipping)?.Id,
        isEmailVerified = false,
        authenticationMode = "Password",
        stores = Array.Empty<object>(),
    };
}
