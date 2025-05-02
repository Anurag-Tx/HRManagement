using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JDPortal.Models;

public class JobDescription
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public string Title { get; set; }
    
    [Required]
    public string Description { get; set; }
    
    public string? Requirements { get; set; }
    
    public string? Department { get; set; }
    
    public string? Location { get; set; }
    
    public string? Client { get; set; }
    
    [Required]
    public DateTime PostedDate { get; set; }
    
    public DateTime? LastDate { get; set; }
    
    public string? Status { get; set; } // Active, Closed, Draft
    
    public string? FilePath { get; set; } // Path to the uploaded JD document
    
    public int? CreatedByUserId { get; set; }
    public virtual ApplicationUser? CreatedByUser { get; set; }
    
    public virtual ICollection<CVSubmission>? CVSubmissions { get; set; }

    [NotMapped]
    public int TotalCVs => CVSubmissions?.Count ?? 0;
    
    [NotMapped]
    public int ReviewedCVs => CVSubmissions?.Count(c => c.Status != "Pending") ?? 0;
} 