using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JDPortal.Data;
using JDPortal.Models;
using System.Linq;
using System.Threading.Tasks;

namespace JDPortal.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetDashboardStats()
    {
        var totalJobDescriptions = await _context.JobDescriptions.CountAsync();
        var totalCVs = await _context.CVSubmissions.CountAsync();
        var pendingReviews = await _context.CVSubmissions
            .CountAsync(c => c.Status == "Pending");

        var cvStatusSummary = new
        {
            pending = await _context.CVSubmissions.CountAsync(c => c.Status == "Pending"),
            accepted = await _context.CVSubmissions.CountAsync(c => c.Status == "Accepted"),
            rejected = await _context.CVSubmissions.CountAsync(c => c.Status == "Rejected")
        };

        var recentActivities = await _context.Notifications
            .OrderByDescending(n => n.CreatedDate)
            .Take(10)
            .Select(n => new
            {
                n.Id,
                n.NotificationType,
                n.Title,
                n.Message,
                Date = n.CreatedDate.ToString("yyyy-MM-dd HH:mm:ss")
            })
            .ToListAsync();

        return new
        {
            totalJobDescriptions,
            totalCVs,
            pendingReviews,
            cvStatusSummary,
            recentActivities
        };
    }
} 