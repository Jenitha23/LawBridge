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
// Environment Variables
// ============================================================

DotNetEnv.Env.Load();

// ============================================================
// Main Application Database
// ============================================================

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

// ============================================================
// RAG / Vector Database
// ============================================================

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
// CORS
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

// -------------------------
// Repositories
// -------------------------

builder.Services.AddScoped<IUserRepository, UserRepository>();

builder.Services.AddScoped<
    ILegalDocumentRepository,
    LegalDocumentRepository
>();

builder.Services.AddScoped<IChatRepository, ChatRepository>();

builder.Services.AddScoped<
    IUserDocumentRepository,
    UserDocumentRepository
>();

// -------------------------
// Authentication / Admin
// -------------------------

builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddScoped<IJwtService, JwtService>();

builder.Services.AddScoped<IAdminService, AdminService>();

builder.Services.AddScoped<
    IAdminDashboardService,
    AdminDashboardService
>();

// -------------------------
// Azure Blob Storage
// -------------------------

builder.Services.AddScoped<BlobStorageService>();

// -------------------------
// AI / RAG / Document Services
// -------------------------

builder.Services.AddScoped<EmbeddingService>();

builder.Services.AddScoped<UserDocumentService>();

builder.Services.AddScoped<LegalChatService>();

builder.Services.AddScoped<PdfService>();

// ============================================================
// HTTP Client
// ============================================================

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
    options.CustomSchemaIds(type => type.FullName);
});

// ============================================================
// Build Application
// ============================================================

var app = builder.Build();

// ============================================================
// Middleware Pipeline
// ============================================================

app.UseSwagger();

app.UseSwaggerUI();

app.UseStaticFiles();

app.UseRouting();

// CORS must be before Authentication / Authorization
app.UseCors("LawBridgeCors");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();