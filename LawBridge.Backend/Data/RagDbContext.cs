using Microsoft.EntityFrameworkCore;
using LawBridge.Backend.Models;
using Pgvector.EntityFrameworkCore;


namespace LawBridge.Backend.Data;


public class RagDbContext : DbContext
{

    public RagDbContext(
        DbContextOptions<RagDbContext> options
    ) : base(options)
    {

    }


    public DbSet<LegalChunk> LegalChunks { get; set; }


    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {

        modelBuilder.HasPostgresExtension("vector");


        modelBuilder.Entity<LegalChunk>(entity =>
        {

            entity.HasKey(x => x.Id);


            entity.Property(x => x.Text)
                .HasColumnType("text");


            entity.Property(x => x.Embedding)
                .HasColumnType("vector(1536)");

        });

    }

}