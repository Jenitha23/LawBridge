namespace LawBridge.Backend.DTOs.User;

public class UpdateProfileDto
{
    public string Name { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string PreferredLanguage { get; set; } = "English";
}