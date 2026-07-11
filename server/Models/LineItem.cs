namespace Server.Models;

// Позиция корзины: ссылка на товар + количество.
public class LineItem
{
    public string Id { get; set; } = default!;
    public string CartId { get; set; } = default!;
    public Cart Cart { get; set; } = default!;

    public string ProductId { get; set; } = default!;
    public Product Product { get; set; } = default!;

    public int Quantity { get; set; }
}
