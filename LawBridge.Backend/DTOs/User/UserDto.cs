namespace LawBridge.Backend.DTOs.User;

public class UserDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string PreferredLanguage { get; set; } = string.Empty;

    public string? ProfileImage { get; set; }

    public DateTime CreatedAt { get; set; }
}