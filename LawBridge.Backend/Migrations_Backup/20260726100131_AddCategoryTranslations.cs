using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LawBridge.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoryTranslations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DescriptionSinhala",
                table: "LegalCategories",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DescriptionTamil",
                table: "LegalCategories",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NameSinhala",
                table: "LegalCategories",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NameTamil",
                table: "LegalCategories",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DescriptionSinhala",
                table: "LegalCategories");

            migrationBuilder.DropColumn(
                name: "DescriptionTamil",
                table: "LegalCategories");

            migrationBuilder.DropColumn(
                name: "NameSinhala",
                table: "LegalCategories");

            migrationBuilder.DropColumn(
                name: "NameTamil",
                table: "LegalCategories");
        }
    }
}
