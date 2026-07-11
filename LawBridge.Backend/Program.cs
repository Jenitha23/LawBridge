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
// CORS
// Allow React Frontend
// ===============================

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy
            .WithOrigins(
                "http://localhost:5173"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
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




// ===============================
// Controllers
// ===============================

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen();





var app = builder.Build();




// ===============================
// Swagger
// ===============================

app.UseSwagger();

app.UseSwaggerUI();




// ===============================
// Middleware Order
// ===============================


// CORS MUST be before Authentication
app.UseCors("AllowReactApp");


app.UseAuthentication();

app.UseAuthorization();


app.MapControllers();




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




app.Run();