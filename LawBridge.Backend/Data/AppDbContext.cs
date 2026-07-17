using Microsoft.EntityFrameworkCore;
using LawBridge.Backend.Models;


namespace LawBridge.Backend.Data;


public class AppDbContext : DbContext
{

    public AppDbContext(
        DbContextOptions<AppDbContext> options
    ) : base(options)
    {

    }


    public DbSet<User> Users { get; set; }
    public DbSet<RefreshToken> RefreshTokens {get;set;}
    public DbSet<LegalCategory> LegalCategories { get; set; }
    public DbSet<LegalDocument> LegalDocuments { get; set; }
    


    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {

        modelBuilder.Entity<User>()
            .HasIndex(x => x.Email)
            .IsUnique();


        base.OnModelCreating(modelBuilder);
    }


}