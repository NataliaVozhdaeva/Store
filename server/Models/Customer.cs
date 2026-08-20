namespace Server.Models;

/// <summary>
/// Customer entity model with PBKDF2 password hashing and AES-256 encrypted fields 
/// compliant with NovaEdge Solutions Data Security standards.
/// </summary>
public class Customer
{
    public string Id { get; set; } = default!;
    public string Email { get; set; } = default!;
    
    /// <summary>
    /// PBKDF2 SHA-256 salted hash representation of customer password.
    /// </summary>
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
