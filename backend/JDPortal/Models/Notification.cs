using System.ComponentModel.DataAnnotations;

namespace JDPortal.Models;

public class Notification
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public string Title { get; set; }
    
    [Required]
    public string Message { get; set; }
    
    public string NotificationType { get; set; } // JD_Created, CV_Uploaded, CV_Reviewed
    
    [Required]
    public DateTime CreatedDate { get; set; }
    
    public bool IsRead { get; set; }
    
    public int UserId { get; set; }
    public ApplicationUser User { get; set; }
    
    public int? JobDescriptionId { get; set; }
    public JobDescription JobDescription { get; set; }
    
    public int? CVSubmissionId { get; set; }
    public CVSubmission CVSubmission { get; set; }

    //// Add new columns
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsActive { get; set; } = true;
} 