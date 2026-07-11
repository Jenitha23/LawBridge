using Microsoft.EntityFrameworkCore;
using LawBridge.Backend.Data;
using LawBridge.Backend.Interfaces;
using LawBridge.Backend.Repositories;
using LawBridge.Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);



builder.Services.AddDbContext<AppDbContext>(options =>
{

    options.UseNpgsql(
        builder.Configuration
        .GetConnectionString("DefaultConnection")
    );

});

builder.Services
.AddAuthentication(
JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{

options.TokenValidationParameters =
new TokenValidationParameters
{

ValidateIssuer = true,

ValidateAudience = true,

ValidateLifetime = true,

ValidateIssuerSigningKey = true,


ValidIssuer =
builder.Configuration["Jwt:Issuer"],


ValidAudience =
builder.Configuration["Jwt:Audience"],


IssuerSigningKey =
new SymmetricSecurityKey(
Encoding.UTF8.GetBytes(
builder.Configuration["Jwt:Key"]!
))

};

});

builder.Services.AddControllers();


builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen();

builder.Services.AddScoped<IUserRepository, UserRepository>();

builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddScoped<IJwtService, JwtService>();

var app = builder.Build();


app.UseSwagger();
app.UseSwaggerUI();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using(var scope = app.Services.CreateScope())
{

    var db =
    scope.ServiceProvider
    .GetRequiredService<AppDbContext>();


    db.Database.Migrate();

}

app.Run();