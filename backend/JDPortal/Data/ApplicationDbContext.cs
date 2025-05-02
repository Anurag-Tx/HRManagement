using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using JDPortal.Models;

namespace JDPortal.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, int>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<JobDescription> JobDescriptions { get; set; }
    public DbSet<CVSubmission> CVSubmissions { get; set; }
    public DbSet<Notification> Notifications { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure relationships
        builder.Entity<JobDescription>()
            .HasOne(jd => jd.CreatedByUser)
            .WithMany(u => u.CreatedJDs)
            .HasForeignKey(jd => jd.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<CVSubmission>()
            .HasOne(cv => cv.SubmittedByUser)
            .WithMany(u => u.SubmittedCVs)
            .HasForeignKey(cv => cv.SubmittedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<CVSubmission>()
            .HasOne(cv => cv.ReviewedByUser)
            .WithMany(u => u.ReviewedCVs)
            .HasForeignKey(cv => cv.ReviewedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Notification>()
            .HasOne(n => n.JobDescription)
            .WithMany()
            .HasForeignKey(n => n.JobDescriptionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
} 