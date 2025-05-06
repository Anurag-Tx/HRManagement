using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using JDPortal.Data;
using JDPortal.Models;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.OpenApi.Writers;

namespace JDPortal.Controllers;

[ApiController]
[Route("api/[controller]")]
//[Authorize]
public class NotificationController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMemoryCache _cache;
    private const string CACHE_KEY_PREFIX = "notifications_";
    private const int CACHE_DURATION_MINUTES = 5;

    public NotificationController(ApplicationDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache = cache;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Notification>>> GetUserNotifications([FromQuery] int userId)
    {
        if (userId <= 0)
        {
            return BadRequest("UserId and role are required");
        }
        var result = await _context.Notifications
              .Include(n => n.JobDescription)
              .Include(n => n.CVSubmission)
              .Where(n =>!n.IsRead && n.IsActive)
              .OrderByDescending(n => n.CreatedDate)
              .Select(n => new
              {
                  n.Id,
                  n.NotificationType,
                  n.Title,
                  n.Message,
                  Date = n.CreatedDate.ToString("yyyy-MM-dd HH:mm:ss")
              })
            .ToListAsync();
        return Ok(result);
    }

    [HttpGet("unread")]
    public async Task<ActionResult<IEnumerable<Notification>>> GetUnreadNotifications()
    {
        var userId = int.Parse(User.FindFirst("sub")?.Value);
        return await _context.Notifications
            .Include(n => n.JobDescription)
            .Include(n => n.CVSubmission)
            .Where(n => n.UserId == userId && !n.IsRead && n.IsActive)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.IsActive);

        if (notification == null)
        {
            return NotFound();
        }

        notification.IsRead = true;
        notification.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = int.Parse(User.FindFirst("sub")?.Value);
        var unreadNotifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead && n.IsActive)
            .ToListAsync();

        foreach (var notification in unreadNotifications)
        {
            notification.IsRead = true;
            notification.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }
}