using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Server.Models;
using Server.Security;

namespace Server.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<LineItem> LineItems => Set<LineItem>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Product>()
            .HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<ProductImage>()
            .HasOne(i => i.Product)
            .WithMany(p => p.Images)
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        b.Entity<Address>()
            .HasOne(a => a.Customer)
            .WithMany(c => c.Addresses)
            .HasForeignKey(a => a.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        b.Entity<LineItem>()
            .HasOne(l => l.Cart)
            .WithMany(c => c.LineItems)
            .HasForeignKey(l => l.CartId)
            .OnDelete(DeleteBehavior.Cascade);

        // Позиция ссылается на товар, но удаление товара не должно рушить корзину
        b.Entity<LineItem>()
            .HasOne(l => l.Product)
            .WithMany()
            .HasForeignKey(l => l.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<Customer>().HasIndex(c => c.Email).IsUnique();

        // AES-256 encryption at rest for customer PII. Email остаётся открытым —
        // по нему идёт поиск/логин (WHERE Email = ...), а зашифрованное поле для этого не годится.
        // DecryptData сам откатывается на исходную строку, если она ещё не зашифрована,
        // поэтому старые незашифрованные записи в базе продолжают читаться корректно.
        var piiConverter = new ValueConverter<string?, string?>(
            v => v == null ? v : CryptoHelper.EncryptData(v),
            v => v == null ? v : CryptoHelper.DecryptData(v));

        b.Entity<Customer>().Property(c => c.FirstName).HasConversion(piiConverter);
        b.Entity<Customer>().Property(c => c.LastName).HasConversion(piiConverter);
        b.Entity<Customer>().Property(c => c.DateOfBirth).HasConversion(piiConverter);
    }
}
