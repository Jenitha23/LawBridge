namespace LawBridge.Backend.DTOs.Admin;


public class UpdateProfileDto
{

    public string Name {get;set;} = string.Empty;


    public string PhoneNumber {get;set;} = string.Empty;


    public string Address {get;set;} = string.Empty;


    public string PreferredLanguage {get;set;} = "English";

}