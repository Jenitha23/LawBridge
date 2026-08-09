using Microsoft.EntityFrameworkCore;
using LawBridge.Backend.Data;
using LawBridge.Backend.Interfaces;
using LawBridge.Backend.Repositories;
using LawBridge.Backend.Services;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

using Pgvector.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ============================================================
// Database Configuration
// ============================================================

// Main application database
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions =>
        {
            npgsqlOptions.MigrationsHistoryTable(
                "__EFMigrationsHistory",
                "app"
            );
        }
    );
});

// RAG / vector database
builder.Services.AddDbContext<RagDbContext>(options =>
{
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("RagConnection"),
        npgsqlOptions =>
        {
            npgsqlOptions.UseVector();

            npgsqlOptions.MigrationsHistoryTable(
                "__EFMigrationsHistory",
                "rag"
            );
        }
    );
});

// ============================================================
// CORS Configuration
// TEMPORARY: Allow all origins for testing
// ============================================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("LawBridgeCors", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ============================================================
// JWT Authentication
// ============================================================

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

// ============================================================
// Dependency Injection
// ============================================================

builder.Services.AddScoped<IUserRepository, UserRepository>();

builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddScoped<IJwtService, JwtService>();

builder.Services.AddScoped<IAdminService, AdminService>();

builder.Services.AddScoped<IAdminDashboardService, AdminDashboardService>();

builder.Services.AddScoped<ILegalDocumentRepository, LegalDocumentRepository>();

builder.Services.AddScoped<IChatRepository, ChatRepository>();

builder.Services.AddScoped<IUserDocumentRepository, UserDocumentRepository>();

// Azure Blob Storage
builder.Services.AddScoped<BlobStorageService>();

// HTTP Client
builder.Services.AddHttpClient();

// ============================================================
// MVC Controllers
// ============================================================

builder.Services.AddControllers();

// ============================================================
// Swagger
// ============================================================

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    // Prevent schema name collisions between DTOs
    // that have the same class name in different namespaces.
    options.CustomSchemaIds(type => type.FullName);
});

// ============================================================
// Environment Variables
// ============================================================

DotNetEnv.Env.Load();

var app = builder.Build();

// ============================================================
// Middleware Pipeline
// ============================================================

app.UseSwagger();

app.UseSwaggerUI();

app.UseStaticFiles();

app.UseRouting();

// IMPORTANT:
// CORS must be after UseRouting and before Authentication/
 // Authorization.
app.UseCors("LawBridgeCors");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();