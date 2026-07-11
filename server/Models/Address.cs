namespace Server.Models;

// Адрес покупателя. Флаги billing/shipping и default* разворачиваются
// на фронтенде в billingAddressIds / defaultShippingAddressId и т.п.
public class Address
{
    public string Id { get; set; } = default!;
    public string CustomerId { get; set; } = default!;
    public Customer Customer { get; set; } = default!;

    public string? StreetName { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string Country { get; set; } = default!;
    public string? PostalCode { get; set; }

    public bool IsBilling { get; set; }
    public bool IsShipping { get; set; }
    public bool IsDefaultBilling { get; set; }
    public bool IsDefaultShipping { get; set; }
}
