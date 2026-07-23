using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LawBridge.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddChatClarification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ClarifyingQuestion",
                table: "ChatMessages",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsClarification",
                table: "ChatMessages",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ClarifyingQuestion",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "NeedsClarification",
                table: "ChatMessages");
        }
    }
}
