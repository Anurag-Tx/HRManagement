using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace JDPortal.Migrations
{
    /// <inheritdoc />
    public partial class AddInterviewManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create Interviewers table
            migrationBuilder.CreateTable(
                name: "Interviewers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Interviewers", x => x.Id);
                });

            // Create InterviewStatuses table
            migrationBuilder.CreateTable(
                name: "InterviewStatuses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CandidateName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    JobDescriptionId = table.Column<int>(type: "int", nullable: false),
                    InterviewDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    InterviewTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    InterviewType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Feedback = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterviewStatuses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterviewStatuses_JobDescriptions_JobDescriptionId",
                        column: x => x.JobDescriptionId,
                        principalTable: "JobDescriptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            // Create InterviewerAssignments table
            migrationBuilder.CreateTable(
                name: "InterviewerAssignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InterviewStatusId = table.Column<int>(type: "int", nullable: false),
                    InterviewerId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterviewerAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterviewerAssignments_InterviewStatuses_InterviewStatusId",
                        column: x => x.InterviewStatusId,
                        principalTable: "InterviewStatuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InterviewerAssignments_Interviewers_InterviewerId",
                        column: x => x.InterviewerId,
                        principalTable: "Interviewers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            // Create indexes
            migrationBuilder.CreateIndex(
                name: "IX_InterviewStatuses_JobDescriptionId",
                table: "InterviewStatuses",
                column: "JobDescriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewerAssignments_InterviewerId",
                table: "InterviewerAssignments",
                column: "InterviewerId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewerAssignments_InterviewStatusId",
                table: "InterviewerAssignments",
                column: "InterviewStatusId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "InterviewerAssignments");
            migrationBuilder.DropTable(name: "InterviewStatuses");
            migrationBuilder.DropTable(name: "Interviewers");
        }
    }
}
