namespace LawBridge.Backend.Helpers;

public static class PasswordHelper
{
    public static string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public static bool Verify(string password, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }

    // Optional alias
    public static bool VerifyPassword(string password, string hash)
    {
        return Verify(password, hash);
    }
}