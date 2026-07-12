
namespace LawBridge.Backend.Models;

public class User
{
    public int Id { get; set; }


    public string Name { get; set; } = string.Empty;


    public string Email { get; set; } = string.Empty;


    public string PasswordHash { get; set; } = string.Empty;


    public string PreferredLanguage { get; set; } = "English";


    public DateTime CreatedAt { get; set; }


    public DateTime UpdatedAt { get; set; }
    public string? ProfileImage { get; set; }

    public string PhoneNumber { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;
    public string Role { get; set; } = "User";
}