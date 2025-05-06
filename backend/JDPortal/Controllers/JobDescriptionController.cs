using Microsoft.AspNetCore.Mvc;
// using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using JDPortal.Data;
using JDPortal.Models;
using Microsoft.AspNetCore.Hosting;

namespace JDPortal.Controllers;

[ApiController]
[Route("api/[controller]")]
// [Authorize]
public class JobDescriptionController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public JobDescriptionController(ApplicationDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<JobDescription>>> GetJobDescriptions()
    {
        return await _context.JobDescriptions
            .Include(j => j.CreatedByUser)
            .Include(j => j.CVSubmissions)
            .OrderByDescending(j => j.PostedDate)
            .ToListAsync();
    }

    [HttpGet("recent")]
    public async Task<ActionResult<IEnumerable<JobDescription>>> GetRecentJobDescriptions()
    {
        return await _context.JobDescriptions
            .Include(j => j.CreatedByUser)
            .Include(j => j.CVSubmissions)
            .Where(j => j.IsActive)
            .OrderByDescending(j => j.PostedDate)
            .Take(5)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<JobDescription>> GetJobDescription(int id)
    {
        var jobDescription = await _context.JobDescriptions
            .Include(j => j.CreatedByUser)
            .Include(j => j.CVSubmissions)
                .ThenInclude(c => c.SubmittedByUser)
            .Include(j => j.CVSubmissions)
                .ThenInclude(c => c.ReviewedByUser)
            .FirstOrDefaultAsync(j => j.Id == id);

        if (jobDescription == null)
        {
            return NotFound();
        }

        return jobDescription;
    }

    [HttpGet("{id}/cvs")]
    public async Task<ActionResult<IEnumerable<CVSubmission>>> GetCVsForJobDescription(int id)
    {
        var cvs = await _context.CVSubmissions
            .Include(c => c.SubmittedByUser)
            .Include(c => c.ReviewedByUser)
            .Where(c => c.JobDescriptionId == id)
            .OrderByDescending(c => c.SubmissionDate)
            .ToListAsync();

        return cvs;
    }

    [HttpPost]
    // [Authorize(Roles = "Manager")]
    public async Task<ActionResult<JobDescription>> CreateJobDescription(IFormFile? file, [FromForm] JobDescription jobDescription)
    {
        // Use fixed manager ID for testing
        var managerId = 4; // Fixed manager ID
        var currentUser = await _context.Users.FindAsync(managerId);

        if (currentUser == null)
        {
            return BadRequest("Manager user not found");
        }

        if (file != null && file.Length > 0)
        {
            // Validate file format
            var allowedExtensions = new[] { ".pdf", ".doc", ".docx" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest("Invalid file format. Only PDF and DOC files are allowed.");
            }

            // Validate file size (e.g., 5MB limit)
            var maxFileSize = 5 * 1024 * 1024; // 5MB
            if (file.Length > maxFileSize)
            {
                return BadRequest("File size exceeds the limit of 5MB");
            }

            var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "jds");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsFolder, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            jobDescription.FilePath = $"/uploads/jds/{fileName}";
        }

        jobDescription.IsActive = true;
        jobDescription.PostedDate = DateTime.UtcNow;
        _context.JobDescriptions.Add(jobDescription);
        await _context.SaveChangesAsync();
        // Create notification for HR users
        var hrUsers = await _context.Users.Where(u => u.Role == "HR").ToListAsync();
        foreach (var hrUser in hrUsers)
        {
            var notification = new Notification
            {
                Title = "New Job Description Posted",
                Message = $"A new job description '{jobDescription.Title}' has been posted by {currentUser.UserName}.",
                NotificationType = "JD_Created",
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                IsRead = false,
                UserId = currentUser.Id,
                JobDescriptionId = jobDescription.Id
            };
            _context.Notifications.Add(notification);
        }
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetJobDescription), new { id = jobDescription.Id }, jobDescription);
    }

    [HttpPut("{id}")]
    // [Authorize(Roles = "Manager")]
    public async Task<IActionResult> UpdateJobDescription(int id, IFormFile? file, [FromForm] JobDescription jobDescription)
    {

        var existingJobDescription = await _context.JobDescriptions.FindAsync(id);
        if (existingJobDescription == null)
        {
            return NotFound();
        }

        if (file != null && file.Length > 0)
        {
            // Validate file format
            var allowedExtensions = new[] { ".pdf", ".doc", ".docx" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest("Invalid file format. Only PDF and DOC files are allowed.");
            }

            // Validate file size (e.g., 5MB limit)
            var maxFileSize = 5 * 1024 * 1024; // 5MB
            if (file.Length > maxFileSize)
            {
                return BadRequest("File size exceeds the limit of 5MB");
            }

            var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "jds");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsFolder, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            jobDescription.FilePath = $"/uploads/jds/{fileName}";
        }
        else
        {
            // Keep the existing file path if no new file is uploaded
            jobDescription.FilePath = existingJobDescription.FilePath;
        }

        jobDescription.UpdatedAt = DateTime.UtcNow;
        _context.Entry(existingJobDescription).CurrentValues.SetValues(jobDescription);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<ApplicationUser>>> GetUsers()
    {
        return await _context.Users.ToListAsync();
    }

    [HttpDelete("{id}")]
    // [Authorize(Roles = "Manager")]
    public async Task<IActionResult> DeleteJobDescription(int id)
    {
        var jobDescription = await _context.JobDescriptions.FindAsync(id);
        if (jobDescription == null)
        {
            return NotFound();
        }

        // Soft delete
        jobDescription.IsActive = false;
        jobDescription.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }
} 