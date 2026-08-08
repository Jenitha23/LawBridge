using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LawBridge.Backend.Migrations.AppDb
{
    /// <inheritdoc />
    public partial class InitialAppSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "app");

            migrationBuilder.RenameTable(
                name: "Users",
                newName: "Users",
                newSchema: "app");

            migrationBuilder.RenameTable(
                name: "UserDocuments",
                newName: "UserDocuments",
                newSchema: "app");

            migrationBuilder.RenameTable(
                name: "RefreshTokens",
                newName: "RefreshTokens",
                newSchema: "app");

            migrationBuilder.RenameTable(
                name: "LegalDocuments",
                newName: "LegalDocuments",
                newSchema: "app");

            migrationBuilder.RenameTable(
                name: "LegalCategories",
                newName: "LegalCategories",
                newSchema: "app");

            migrationBuilder.RenameTable(
                name: "ChatMessages",
                newName: "ChatMessages",
                newSchema: "app");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "Users",
                schema: "app",
                newName: "Users");

            migrationBuilder.RenameTable(
                name: "UserDocuments",
                schema: "app",
                newName: "UserDocuments");

            migrationBuilder.RenameTable(
                name: "RefreshTokens",
                schema: "app",
                newName: "RefreshTokens");

            migrationBuilder.RenameTable(
                name: "LegalDocuments",
                schema: "app",
                newName: "LegalDocuments");

            migrationBuilder.RenameTable(
                name: "LegalCategories",
                schema: "app",
                newName: "LegalCategories");

            migrationBuilder.RenameTable(
                name: "ChatMessages",
                schema: "app",
                newName: "ChatMessages");
        }
    }
}
