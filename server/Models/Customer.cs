namespace Server.Models;

// Покупатель. Пароль хранится в открытом виде — только для учебного демо!
// В реальном проекте здесь был бы хэш (BCrypt / ASP.NET Identity).
public class Customer
{
    public string Id { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string Password { get; set; } = default!;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? DateOfBirth { get; set; }
    public bool IsAdmin { get; set; }

    public int Version { get; set; } = 1;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastModifiedAt { get; set; } = DateTime.UtcNow;

    public List<Address> Addresses { get; set; } = new();
}
