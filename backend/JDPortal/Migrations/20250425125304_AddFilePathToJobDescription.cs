using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JDPortal.Migrations
{
    /// <inheritdoc />
    public partial class AddFilePathToJobDescription : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FilePath",
                table: "JobDescriptions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FilePath",
                table: "JobDescriptions");
        }
    }
}
