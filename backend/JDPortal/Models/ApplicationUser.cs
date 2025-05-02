using Microsoft.AspNetCore.Identity;

namespace JDPortal.Models;

public class ApplicationUser : IdentityUser<int>
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Department { get; set; }
    public string Role { get; set; } // Primary role of the user
    
    public ICollection<JobDescription> CreatedJDs { get; set; }
    public ICollection<CVSubmission> SubmittedCVs { get; set; }
    public ICollection<CVSubmission> ReviewedCVs { get; set; }
    public ICollection<Notification> Notifications { get; set; }
} 