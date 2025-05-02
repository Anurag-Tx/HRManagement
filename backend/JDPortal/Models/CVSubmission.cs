using System.ComponentModel.DataAnnotations;

namespace JDPortal.Models;

public class CVSubmission
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public string CandidateName { get; set; }
    
    [Required]
    [EmailAddress]
    public string CandidateEmail { get; set; }
    
    [Required]
    public string CVFilePath { get; set; }
    
    public string Status { get; set; } // Pending, Accepted, Rejected
    
    public string Comments { get; set; }
    
    [Required]
    public DateTime SubmissionDate { get; set; }
    
    public DateTime? ReviewedDate { get; set; }
    
    public int JobDescriptionId { get; set; }
    public JobDescription JobDescription { get; set; }
    
    public int SubmittedByUserId { get; set; }
    public ApplicationUser SubmittedByUser { get; set; }
    
    public int? ReviewedByUserId { get; set; }
    public ApplicationUser ReviewedByUser { get; set; }

    public ICollection<Notification> Notifications { get; set; }
} 

public class CVsubmissionDTO
{
    public string CandidateName { get; set; }
    public int jobDescriptionID { get; set; }
    [Required]
    [EmailAddress]
    public string CandidateEmail { get; set; }
    public DateTime SubmissionDate { get; set; }
}