using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JDPortal.Migrations
{
    /// <inheritdoc />
    public partial class AddCascadeDeleteForJobDescriptionNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_JobDescriptions_JobDescriptionId",
                table: "Notifications");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_JobDescriptions_JobDescriptionId",
                table: "Notifications",
                column: "JobDescriptionId",
                principalTable: "JobDescriptions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_JobDescriptions_JobDescriptionId",
                table: "Notifications");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_JobDescriptions_JobDescriptionId",
                table: "Notifications",
                column: "JobDescriptionId",
                principalTable: "JobDescriptions",
                principalColumn: "Id");
        }
    }
}
