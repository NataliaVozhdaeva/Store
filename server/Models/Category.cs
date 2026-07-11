namespace Server.Models;

// Категория товаров. Id строковый ("cat-fruits"), чтобы совпадать
// с тем, что фронтенд уже использует для фильтрации каталога.
public class Category
{
    public string Id { get; set; } = default!;
    public string Key { get; set; } = default!;
    public string NameEn { get; set; } = default!;
    public int OrderHint { get; set; }

    public List<Product> Products { get; set; } = new();
}
