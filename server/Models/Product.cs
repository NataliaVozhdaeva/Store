namespace Server.Models;

// Товар каталога. Цены хранятся в центах (int), как в commercetools.
public class Product
{
    public string Id { get; set; } = default!;
    public string NameEn { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public string DescriptionEn { get; set; } = default!;

    public string CategoryId { get; set; } = default!;
    public Category Category { get; set; } = default!;

    public int CentAmount { get; set; }
    public int? DiscountedCentAmount { get; set; }

    public int Version { get; set; } = 1;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastModifiedAt { get; set; } = DateTime.UtcNow;

    public List<ProductImage> Images { get; set; } = new();
}
