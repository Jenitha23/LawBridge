using FluentValidation;
using LawBridge.Backend.DTOs.Auth;


public class RegisterValidator:
AbstractValidator<RegisterDto>
{

public RegisterValidator()
{

RuleFor(x=>x.Name)
.NotEmpty()
.MaximumLength(100);


RuleFor(x=>x.Email)
.NotEmpty()
.EmailAddress();


RuleFor(x=>x.Password)
.NotEmpty()
.MinimumLength(6);


RuleFor(x=>x.PreferredLanguage)
.Must(x =>
x=="English" ||
x=="Sinhala" ||
x=="Tamil");

}

}