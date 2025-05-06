using System;
using System.Linq;
using System.Threading.Tasks;
using JDPortal.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace JDPortal.Data
{
    public static class DbInitializer
    {
        public static async Task Initialize(IServiceProvider serviceProvider)
        {
            using var context = new ApplicationDbContext(
                serviceProvider.GetRequiredService<DbContextOptions<ApplicationDbContext>>());

            // Seed interviewers if none exist
            if (!context.Interviewers.Any())
            {
                var interviewers = new[]
                {
                    new Interviewer
                    {
                        Name = "John Doe",
                        Role = "Technical Lead",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Interviewer
                    {
                        Name = "Jane Smith",
                        Role = "HR Manager",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Interviewer
                    {
                        Name = "Mike Johnson",
                        Role = "Senior Developer",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Interviewer
                    {
                        Name = "Sarah Williams",
                        Role = "Project Manager",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    }
                };

                await context.Interviewers.AddRangeAsync(interviewers);
                await context.SaveChangesAsync();
            }
        }
    }
} 