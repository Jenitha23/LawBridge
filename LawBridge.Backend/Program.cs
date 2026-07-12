using Microsoft.EntityFrameworkCore;
using LawBridge.Backend.Data;
using LawBridge.Backend.Interfaces;
using LawBridge.Backend.Repositories;
using LawBridge.Backend.Services;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

using System.Text;


var builder = WebApplication.CreateBuilder(args);


// ===============================
// Database Configuration
// ===============================

// ===============================
// Database
// ===============================

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(
        builder.Configuration
        .GetConnectionString("DefaultConnection")
    );
});



// ===============================
// CORS Configuration
// Allow React Frontend
// ===============================

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy
            .WithOrigins(
                "http://localhost:5173"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
        });
});



// ===============================
// JWT Authentication
// ===============================

builder.Services
.AddAuthentication(
    JwtBearerDefaults.AuthenticationScheme
)
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
            )
        )

    };

});



// ===============================
// Dependency Injection
// ===============================

builder.Services.AddScoped<IUserRepository, UserRepository>();

builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IAdminService, AdminService>();


// ===============================
// MVC Controllers
// ===============================

builder.Services.AddControllers();



builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen();
builder.Services.AddScoped<IUserRepository, UserRepository>();


var app = builder.Build();



// ===============================
// Automatic Database Migration
// ===============================




// ===============================
// Auto Database Migration
// ===============================

using(var scope = app.Services.CreateScope())
{

    var db =
    scope.ServiceProvider
    .GetRequiredService<AppDbContext>();


    db.Database.Migrate();

}



// ===============================
// Middleware Pipeline
// ===============================

app.UseSwagger();

app.UseSwaggerUI();


// CORS must be before Authorization
app.UseCors("AllowFrontend");

app.UseStaticFiles();
app.UseAuthentication();

app.UseAuthorization();


app.MapControllers();


app.Run();