using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LawBridge.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentViewCount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ViewCount",
                table: "LegalDocuments",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ViewCount",
                table: "LegalDocuments");
        }
    }
}
