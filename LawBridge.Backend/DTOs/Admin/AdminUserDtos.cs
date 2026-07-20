namespace LawBridge.Backend.DTOs.Admin;


public class AdminUserListItemDto
{

    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PreferredLanguage { get; set; } = string.Empty;

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

}


public class AdminUserDetailDto
{

    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string PreferredLanguage { get; set; } = string.Empty;

    public string? ProfileImage { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

}


public class UpdateUserStatusDto
{

    public bool IsActive { get; set; }

}
