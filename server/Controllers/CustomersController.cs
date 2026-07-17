using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Dtos;
using Server.Models;

namespace Server.Controllers;

public record AddressInput(
    [Required(ErrorMessage = "Country is required")] string Country,
    [Required(ErrorMessage = "Street is required")]
    [RegularExpression("^[a-zA-Z ]+$", ErrorMessage = "Street must contain only Latin letters")]
    string? StreetName,
    [Required(ErrorMessage = "Postal code is required")] string? PostalCode,
    [Required(ErrorMessage = "City is required")] string? City,
    string? State);

public record RegisterInput(
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Email must be a properly formatted address")]
    string Email,
    [Required(ErrorMessage = "Password is required")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=\S+$).{8,}$",
        ErrorMessage = "Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one digit, no whitespace")]
    string Password,
    [Required(ErrorMessage = "First name is required")]
    [RegularExpression("^[a-zA-Z ]+$", ErrorMessage = "First name must contain only Latin letters")]
    string? FirstName,
    [Required(ErrorMessage = "Last name is required")]
    [RegularExpression("^[a-zA-Z ]+$", ErrorMessage = "Last name must contain only Latin letters")]
    string? LastName,
    [Required(ErrorMessage = "Date of birth is required")] string? DateOfBirth,
    AddressInput? Billing,
    AddressInput? Shipping,
    bool DefaultBilling,
    bool DefaultShipping,
    bool? IsAdmin) : IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (DateOfBirth is not null &&
            DateTime.TryParse(DateOfBirth, out var dob) &&
            dob > DateTime.UtcNow.AddYears(-13))
        {
            yield return new ValidationResult(
                "Customer must be at least 13 years old",
                new[] { nameof(DateOfBirth) });
        }
    }
}
public record LoginInput(
    [Required(ErrorMessage = "Email is required")] string Email,
    [Required(ErrorMessage = "Password is required")] string Password);
public record ProfileInput(string? FirstName, string? LastName, string? DateOfBirth, string Email);
public record PasswordInput(string OldPassword, string NewPassword);
public record EditAddressInput(string? StreetName, string? City, string? State, string Country, string? PostalCode);
public record DefaultAddressInput(string AddressId, bool Value);

[ApiController]
[Route("api/customers")]
public class CustomersController : ControllerBase
{
    private readonly AppDbContext _db;
    public CustomersController(AppDbContext db) => _db = db;

    private async Task<Customer?> Load(string id) =>
        await _db.Customers.Include(c => c.Addresses).FirstOrDefaultAsync(c => c.Id == id);

    private async Task<IActionResult> SaveAndReturn(Customer c)
    {
        c.Version += 1;
        c.LastModifiedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(Mappers.Customer(c));
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterInput input)
    {
        var taken = await _db.Customers.AnyAsync(c => c.Email.ToLower() == input.Email.ToLower());
        if (taken) return Conflict($"Customer with email {input.Email} already exists");

        var customer = new Customer
        {
            Id = Guid.NewGuid().ToString(),
            Email = input.Email,
            Password = input.Password,
            FirstName = input.FirstName,
            LastName = input.LastName,
            DateOfBirth = input.DateOfBirth,
            IsAdmin = input.IsAdmin ?? false,
        };

        if (input.Billing is not null)
            customer.Addresses.Add(MakeAddress(input.Billing, billing: true, isDefault: input.DefaultBilling));
        if (input.Shipping is not null)
            customer.Addresses.Add(MakeAddress(input.Shipping, billing: false, isDefault: input.DefaultShipping));

        _db.Customers.Add(customer);
        await _db.SaveChangesAsync();
        return Ok(Mappers.Customer(customer));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginInput input)
    {
        var customer = await _db.Customers.Include(c => c.Addresses)
            .FirstOrDefaultAsync(c => c.Email.ToLower() == input.Email.ToLower() && c.Password == input.Password);
        return customer is null ? Unauthorized("Invalid credentials") : Ok(Mappers.Customer(customer));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id)
    {
        var customer = await Load(id);
        return customer is null ? NotFound() : Ok(Mappers.Customer(customer));
    }

    [HttpGet("by-email/{email}")]
    public async Task<IActionResult> GetByEmail(string email)
    {
        var customer = await _db.Customers.Include(c => c.Addresses)
            .FirstOrDefaultAsync(c => c.Email.ToLower() == email.ToLower());
        return customer is null ? NotFound() : Ok(Mappers.Customer(customer));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProfile(string id, ProfileInput input)
    {
        var customer = await Load(id);
        if (customer is null) return NotFound();
        customer.FirstName = input.FirstName;
        customer.LastName = input.LastName;
        customer.DateOfBirth = input.DateOfBirth;
        customer.Email = input.Email;
        return await SaveAndReturn(customer);
    }

    [HttpPut("{id}/password")]
    public async Task<IActionResult> ChangePassword(string id, PasswordInput input)
    {
        var customer = await Load(id);
        if (customer is null) return NotFound();
        if (customer.Password != input.OldPassword)
            return BadRequest("The given current password does not match");
        customer.Password = input.NewPassword;
        return await SaveAndReturn(customer);
    }

    [HttpPut("{id}/addresses/{addressId}")]
    public async Task<IActionResult> EditAddress(string id, string addressId, EditAddressInput input)
    {
        var customer = await Load(id);
        if (customer is null) return NotFound();
        var address = customer.Addresses.FirstOrDefault(a => a.Id == addressId);
        if (address is null) return NotFound($"Address {addressId} not found");
        address.StreetName = input.StreetName;
        address.City = input.City;
        address.State = input.State;
        address.Country = input.Country;
        address.PostalCode = input.PostalCode;
        return await SaveAndReturn(customer);
    }

    [HttpPut("{id}/default-shipping")]
    public async Task<IActionResult> SetDefaultShipping(string id, DefaultAddressInput input)
    {
        var customer = await Load(id);
        if (customer is null) return NotFound();
        foreach (var a in customer.Addresses) a.IsDefaultShipping = false;
        if (input.Value)
        {
            var target = customer.Addresses.FirstOrDefault(a => a.Id == input.AddressId);
            if (target is not null) target.IsDefaultShipping = true;
        }
        return await SaveAndReturn(customer);
    }

    [HttpPut("{id}/default-billing")]
    public async Task<IActionResult> SetDefaultBilling(string id, DefaultAddressInput input)
    {
        var customer = await Load(id);
        if (customer is null) return NotFound();
        foreach (var a in customer.Addresses) a.IsDefaultBilling = false;
        if (input.Value)
        {
            var target = customer.Addresses.FirstOrDefault(a => a.Id == input.AddressId);
            if (target is not null) target.IsDefaultBilling = true;
        }
        return await SaveAndReturn(customer);
    }

    private static Address MakeAddress(AddressInput input, bool billing, bool isDefault) => new()
    {
        Id = Guid.NewGuid().ToString(),
        Country = input.Country,
        StreetName = input.StreetName,
        City = input.City,
        State = input.State,
        PostalCode = input.PostalCode,
        IsBilling = billing,
        IsShipping = !billing,
        IsDefaultBilling = billing && isDefault,
        IsDefaultShipping = !billing && isDefault,
    };
}
