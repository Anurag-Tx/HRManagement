using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JDPortal.Migrations
{
    /// <inheritdoc />
    public partial class AddClientToJobDescriptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Client",
                table: "JobDescriptions",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Client",
                table: "JobDescriptions");
        }
    }
}
