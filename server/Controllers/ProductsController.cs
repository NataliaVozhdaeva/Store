using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Dtos;
using Server.Models;

namespace Server.Controllers;

// Тело запроса на создание/редактирование товара (админ-CMS)
public record ProductInput(
    string Name,
    string CategoryId,
    int CentAmount,
    int? DiscountedCentAmount,
    string Description,
    List<string>? ImageUrls);

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ProductsController(AppDbContext db) => _db = db;

    private IQueryable<Product> WithIncludes() =>
        _db.Products.Include(p => p.Images).Include(p => p.Category);

    // Каталог — постраничный ответ, как GetProductsPublished
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var products = await WithIncludes().OrderBy(p => p.NameEn).ToListAsync();
        return Ok(Mappers.Paged(products.Select(Mappers.Product)));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOne(string id)
    {
        var product = await WithIncludes().FirstOrDefaultAsync(p => p.Id == id);
        return product is null ? NotFound() : Ok(Mappers.Product(product));
    }

    // ---- Админские CRUD-операции ----

    [HttpPost]
    public async Task<IActionResult> Create(ProductInput input)
    {
        if (!await _db.Categories.AnyAsync(c => c.Id == input.CategoryId))
            return BadRequest($"Category {input.CategoryId} not found");

        var slug = Slugify(input.Name);
        var id = $"prod-{slug}";
        if (await _db.Products.AnyAsync(p => p.Id == id))
            id = $"{id}-{Guid.NewGuid().ToString()[..8]}";

        var product = new Product
        {
            Id = id,
            NameEn = input.Name,
            Slug = slug,
            DescriptionEn = input.Description,
            CategoryId = input.CategoryId,
            CentAmount = input.CentAmount,
            DiscountedCentAmount = input.DiscountedCentAmount,
        };
        AddImages(product, input.ImageUrls, slug);

        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        var created = await WithIncludes().FirstAsync(p => p.Id == id);
        return Ok(Mappers.Product(created));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, ProductInput input)
    {
        var product = await WithIncludes().FirstOrDefaultAsync(p => p.Id == id);
        if (product is null) return NotFound();

        product.NameEn = input.Name;
        product.Slug = Slugify(input.Name);
        product.DescriptionEn = input.Description;
        product.CategoryId = input.CategoryId;
        product.CentAmount = input.CentAmount;
        product.DiscountedCentAmount = input.DiscountedCentAmount;
        product.Version += 1;
        product.LastModifiedAt = DateTime.UtcNow;

        if (input.ImageUrls is { Count: > 0 })
        {
            _db.ProductImages.RemoveRange(product.Images);
            product.Images = new List<ProductImage>();
            AddImages(product, input.ImageUrls, product.Slug);
        }

        await _db.SaveChangesAsync();
        return Ok(Mappers.Product(product));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product is null) return NotFound();

        // Нельзя удалить товар, который лежит в чьей-то корзине (FK Restrict)
        if (await _db.LineItems.AnyAsync(l => l.ProductId == id))
            return Conflict("Product is referenced by a cart and cannot be deleted.");

        _db.Products.Remove(product);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static void AddImages(Product product, List<string>? urls, string slug)
    {
        var list = urls is { Count: > 0 }
            ? urls
            : new List<string> { $"./images/products/{slug}-1.jpg", $"./images/products/{slug}-2.jpg" };
        var ord = 0;
        foreach (var url in list)
            product.Images.Add(new ProductImage { Url = url, Ord = ord++ });
    }

    private static string Slugify(string name) =>
        new string(name.ToLowerInvariant().Select(ch => char.IsLetterOrDigit(ch) ? ch : '-').ToArray())
            .Trim('-');
}
