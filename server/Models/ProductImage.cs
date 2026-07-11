namespace Server.Models;

// Картинка товара. Ord задаёт порядок: 0 — миниатюра карточки, дальше — слайдер.
public class ProductImage
{
    public int Id { get; set; }
    public string ProductId { get; set; } = default!;
    public Product Product { get; set; } = default!;
    public string Url { get; set; } = default!;
    public int Ord { get; set; }
}
