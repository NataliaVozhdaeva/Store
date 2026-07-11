namespace Server.Models;

// Корзина. Суммы не хранятся — считаются из позиций при отдаче наружу,
// чтобы цифры всегда были согласованы с текущими ценами товаров.
public class Cart
{
    public string Id { get; set; } = default!;
    public string? CustomerId { get; set; }
    public string? DiscountCode { get; set; }

    public int Version { get; set; } = 1;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastModifiedAt { get; set; } = DateTime.UtcNow;

    public List<LineItem> LineItems { get; set; } = new();
}
