using Microsoft.AspNetCore.Identity;

namespace JDPortal.Models;

public class ApplicationRole : IdentityRole<int>
{
    public string Description { get; set; }
} 