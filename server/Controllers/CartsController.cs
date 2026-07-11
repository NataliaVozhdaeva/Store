using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Dtos;
using Server.Models;

namespace Server.Controllers;

public record CreateCartInput(string? CustomerId);
public record AddLineItemInput(string ProductId, int Quantity);
public record ChangeQtyInput(int Quantity);
public record DiscountInput(string Code);
public record AttachCustomerInput(string CustomerId);

[ApiController]
[Route("api/carts")]
public class CartsController : ControllerBase
{
    private readonly AppDbContext _db;
    public CartsController(AppDbContext db) => _db = db;

    // Корзина всегда загружается вместе с позициями и их товарами —
    // маппер считает по ним суммы
    private IQueryable<Cart> Full() => _db.Carts
        .Include(c => c.LineItems).ThenInclude(l => l.Product).ThenInclude(p => p.Images);

    private async Task<Cart?> Load(string id) =>
        await Full().FirstOrDefaultAsync(c => c.Id == id);

    private async Task<IActionResult> Save(Cart cart)
    {
        cart.Version += 1;
        cart.LastModifiedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        // Перечитываем со всеми связями для корректного маппинга
        var fresh = await Load(cart.Id);
        return Ok(Mappers.Cart(fresh!));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateCartInput input)
    {
        var cart = new Cart { Id = Guid.NewGuid().ToString(), CustomerId = input.CustomerId };
        _db.Carts.Add(cart);
        await _db.SaveChangesAsync();
        return Ok(Mappers.Cart(cart));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id)
    {
        var cart = await Load(id);
        return cart is null ? NotFound() : Ok(Mappers.Cart(cart));
    }

    [HttpGet("by-customer/{customerId}")]
    public async Task<IActionResult> GetByCustomer(string customerId)
    {
        var cart = await Full().FirstOrDefaultAsync(c => c.CustomerId == customerId);
        return cart is null ? NotFound() : Ok(Mappers.Cart(cart));
    }

    [HttpPut("{id}/customer")]
    public async Task<IActionResult> AttachCustomer(string id, AttachCustomerInput input)
    {
        var cart = await Load(id);
        if (cart is null) return NotFound();
        cart.CustomerId = input.CustomerId;
        return await Save(cart);
    }

    [HttpPost("{id}/line-items")]
    public async Task<IActionResult> AddLineItem(string id, AddLineItemInput input)
    {
        var cart = await Load(id);
        if (cart is null) return NotFound();
        if (!await _db.Products.AnyAsync(p => p.Id == input.ProductId))
            return BadRequest($"Product {input.ProductId} not found");

        // Если товар уже в корзине — увеличиваем количество
        var existing = cart.LineItems.FirstOrDefault(l => l.ProductId == input.ProductId);
        if (existing is not null)
            existing.Quantity += input.Quantity;
        else
            cart.LineItems.Add(new LineItem
            {
                Id = Guid.NewGuid().ToString(),
                ProductId = input.ProductId,
                Quantity = input.Quantity,
            });
        return await Save(cart);
    }

    [HttpPut("{id}/line-items/{lineItemId}")]
    public async Task<IActionResult> ChangeQuantity(string id, string lineItemId, ChangeQtyInput input)
    {
        var cart = await Load(id);
        if (cart is null) return NotFound();
        var item = cart.LineItems.FirstOrDefault(l => l.Id == lineItemId);
        if (item is null) return NotFound();

        if (input.Quantity <= 0)
            cart.LineItems.Remove(item); // нулевое количество удаляет позицию
        else
            item.Quantity = input.Quantity;
        return await Save(cart);
    }

    [HttpDelete("{id}/line-items/{lineItemId}")]
    public async Task<IActionResult> RemoveLineItem(string id, string lineItemId)
    {
        var cart = await Load(id);
        if (cart is null) return NotFound();
        var item = cart.LineItems.FirstOrDefault(l => l.Id == lineItemId);
        if (item is not null) cart.LineItems.Remove(item);
        return await Save(cart);
    }

    [HttpPost("{id}/discount")]
    public async Task<IActionResult> ApplyDiscount(string id, DiscountInput input)
    {
        var cart = await Load(id);
        if (cart is null) return NotFound();
        if (input.Code != Mappers.DiscountCode)
            return BadRequest("Invalid discount code");
        cart.DiscountCode = input.Code;
        return await Save(cart);
    }

    [HttpDelete("{id}/discount")]
    public async Task<IActionResult> RemoveDiscount(string id)
    {
        var cart = await Load(id);
        if (cart is null) return NotFound();
        cart.DiscountCode = null;
        return await Save(cart);
    }
}
