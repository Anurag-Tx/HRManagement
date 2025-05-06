using Microsoft.AspNetCore.Mvc;
// using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using JDPortal.Data;
using JDPortal.Models;
using System.IO;

namespace JDPortal.Controllers;

[ApiController]
[Route("api/[controller]")]
// [Authorize]
public class CVSubmissionController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public CVSubmissionController(ApplicationDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    [HttpGet("recent")]
    public async Task<ActionResult<IEnumerable<CVSubmission>>> GetRecentCVSubmissions()
    {
        return await _context.CVSubmissions
            .Include(c => c.SubmittedByUser)
            .Include(c => c.ReviewedByUser)
            .Include(c => c.JobDescription)
            .OrderByDescending(c => c.SubmissionDate)
            .Take(10)
            .ToListAsync();
    }

    [HttpGet("jd/{jobDescriptionId}")]
    public async Task<ActionResult<IEnumerable<CVSubmission>>> GetCVSubmissionsForJD(int jobDescriptionId)
    {
        return await _context.CVSubmissions
            .Include(c => c.SubmittedByUser)
            .Include(c => c.ReviewedByUser)
            .Where(t => t.JobDescriptionId == jobDescriptionId)
            .OrderByDescending(c => c.SubmissionDate)
            .ToListAsync();
    }

    [HttpGet("pending")]
    public async Task<ActionResult<IEnumerable<CVSubmission>>> GetPendingCVSubmissions()
    {
        return await _context.CVSubmissions
            .Include(c => c.SubmittedByUser)
            .Include(c => c.JobDescription)
            .Where(c => c.Status == "Pending")
            .OrderByDescending(c => c.SubmissionDate)
            .ToListAsync();
    }

    [HttpPost]
    // [Authorize(Roles = "HR")]
    public async Task<ActionResult<CVSubmission>> UploadCV(IFormFile file, [FromForm] CVsubmissionDTO submission)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

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

        var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "cvs");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Use fixed HR ID for testing
        var hrId = 3; // Fixed HR ID
        var currentUser = await _context.Users.FindAsync(hrId);
        
        if (currentUser == null)
        {
            return BadRequest("HR user not found");
        }

        var jobDescriptionId = submission.jobDescriptionID;
        var jobDescription = await _context.JobDescriptions
            .Include(j => j.CreatedByUser)
            .FirstOrDefaultAsync(j => j.Id == jobDescriptionId);

        if (jobDescription == null)
        {
            return BadRequest("Job Description not found");
        }

        // Create new CVSubmission with proper relationships
        var newSubmission = new CVSubmission
        {
            CandidateName = submission.CandidateName,
            CandidateEmail = submission.CandidateEmail,
            CVFilePath = uniqueFileName,
            SubmissionDate = DateTime.UtcNow,
            Status = "Pending",
            JobDescriptionId = jobDescriptionId,
            JobDescription = jobDescription,
            SubmittedByUserId = hrId,
            SubmittedByUser = currentUser,
            Comments = "CV Uploaded"
        };

        _context.CVSubmissions.Add(newSubmission);
        await _context.SaveChangesAsync();

        // Create notification for the manager who created the JD
        var notification = new Notification
        {
            Title = "New CV Submission",
            Message = $"A new CV has been submitted by {currentUser.UserName} for {jobDescription.Title} position",
            NotificationType = "CV_Uploaded",
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            UserId = currentUser.Id,
            IsRead = false,
            JobDescriptionId = jobDescriptionId,
            CVSubmissionId = newSubmission.Id
        };
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCVSubmission), new { id = newSubmission.Id }, newSubmission);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CVSubmission>> GetCVSubmission(int id)
    {
        var submission = await _context.CVSubmissions
            .Include(c => c.SubmittedByUser)
            .Include(c => c.ReviewedByUser)
            .Include(c => c.JobDescription)
                .ThenInclude(j => j.CreatedByUser)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (submission == null)
        {
            return NotFound();
        }

        return submission;
    }

    [HttpGet("{id}/downloadCV")]
    public async Task<IActionResult> DownloadCV(int id)
    {
        var cv = await _context.CVSubmissions.FindAsync(id);

        if (cv == null)
        {
            return NotFound("CV not found.");
        }

        var filePath = Path.Combine(_environment.WebRootPath, "uploads", "cvs", cv.CVFilePath);

        if (!System.IO.File.Exists(filePath))
        {
            return NotFound("File not found.");
        }

        var contentType = GetContentType(filePath);
        var ext = Path.GetExtension(filePath).ToLowerInvariant();
        var fileName = $"{cv.CandidateName}_CV{ext}";
        
        Response.Headers.Add("Access-Control-Expose-Headers", "Content-Disposition");
        Response.Headers.Add("Content-Disposition", "attachment; filename=" + fileName);
        
        var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
        return File(fileBytes, contentType, fileName);
    }

    [HttpGet("{id}/previewCV")]
    public async Task<IActionResult> PreviewCV(int id)
    {
        var cv = await _context.CVSubmissions.FindAsync(id);

        if (cv == null)
        {
            return NotFound("CV not found.");
        }

        var filePath = Path.Combine(_environment.WebRootPath, "uploads", "cvs", cv.CVFilePath);

        if (!System.IO.File.Exists(filePath))
        {
            return NotFound("File not found.");
        }

        var contentType = GetContentType(filePath);
        var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
        
        // Set content disposition to inline for browser preview
        Response.Headers.Add("Access-Control-Expose-Headers", "Content-Disposition");
        Response.Headers.Add("Content-Disposition", "inline");
        
        return File(fileBytes, contentType);
    }

    [HttpPut("{id}/review")]
    public async Task<IActionResult> ReviewCV(int id, [FromBody] CVReviewModel review)
    {
        var submission = await _context.CVSubmissions
            .Include(c => c.JobDescription)
                .ThenInclude(j => j.CreatedByUser)
            .Include(c => c.SubmittedByUser)
            .FirstOrDefaultAsync(c => c.Id == id);
        
        if (submission == null)
            return NotFound();

        // Use fixed manager ID for testing
        var managerId = 4; // Fixed manager ID
        var currentUser = await _context.Users.FindAsync(managerId);
        
        if (currentUser == null)
        {
            return BadRequest("Manager user not found");
        }

        // Check if the current user is the creator of the JD
        if (submission.JobDescription.CreatedByUserId != managerId)
        {
            return Unauthorized("You can only review CVs for job descriptions you created");
        }

        // Update the submission with proper relationships
        submission.ReviewedByUserId = managerId;
        submission.ReviewedByUser = currentUser;
        submission.Status = review.Status;
        submission.Comments = review.Comments;
        submission.ReviewedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Create notification for the HR user who submitted the CV
        var notification = new Notification
        {
            Title = "CV Review Updated",
            Message = $"Your CV submission for {submission.JobDescription.Title} has been {review.Status.ToLower()} by {currentUser.UserName}",
            NotificationType = "CV_Reviewed",
            CreatedDate = DateTime.UtcNow,
            UserId = submission.SubmittedByUserId,
            JobDescriptionId = submission.JobDescriptionId,
            CVSubmissionId = submission.Id
        };
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    // [Authorize(Roles = "Manager")]
    public async Task<IActionResult> DeleteCVSubmission(int id)
    {
        var cvSubmission = await _context.CVSubmissions
            .Include(c => c.Notifications)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (cvSubmission == null)
        {
            return NotFound();
        }

        // Use fixed manager ID for testing
        var managerId = 4; // Fixed manager ID
        if (cvSubmission.ReviewedByUserId != managerId)
        {
            return Unauthorized("You can only delete CV submissions you reviewed");
        }

        // Delete associated notifications
        if (cvSubmission.Notifications != null)
        {
            _context.Notifications.RemoveRange(cvSubmission.Notifications);
        }

        // Delete the CV submission
        _context.CVSubmissions.Remove(cvSubmission);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private string GetContentType(string path)
    {
        var types = new Dictionary<string, string>
        {
            { ".pdf", "application/pdf" },
            { ".doc", "application/msword" },
            { ".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }
        };

        var ext = Path.GetExtension(path).ToLowerInvariant();
        return types.GetValueOrDefault(ext, "application/octet-stream");
    }
}

public class CVsubmissionDTO
{
    public string CandidateName { get; set; }
    public string CandidateEmail { get; set; }
    public int jobDescriptionID { get; set; }
}

public class CVReviewModel
{
    public string Status { get; set; } // Accepted or Rejected
    public string Comments { get; set; }
} 