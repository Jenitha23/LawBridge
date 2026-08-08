using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LawBridge.Backend.Migrations.RagDb
{
    /// <inheritdoc />
    public partial class InitialRagSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "rag");

            migrationBuilder.RenameTable(
                name: "LegalChunks",
                newName: "LegalChunks",
                newSchema: "rag");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "LegalChunks",
                schema: "rag",
                newName: "LegalChunks");
        }
    }
}
