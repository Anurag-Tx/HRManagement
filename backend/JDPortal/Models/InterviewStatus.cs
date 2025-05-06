using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JDPortal.Models
{
    public class InterviewStatus
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string CandidateName { get; set; }

        [Required]
        public int JobDescriptionId { get; set; }

        [ForeignKey("JobDescriptionId")]
        public JobDescription JobDescription { get; set; }

        [Required]
        public DateTime InterviewDate { get; set; }

        [Required]
        public TimeSpan InterviewTime { get; set; }

        [Required]
        public string InterviewType { get; set; }

        [Required]
        public string Status { get; set; }

        public string Feedback { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation property for assigned interviewers
        public ICollection<InterviewerAssignment> InterviewerAssignments { get; set; }
    }

    public class InterviewerAssignment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int InterviewStatusId { get; set; }

        [ForeignKey("InterviewStatusId")]
        public InterviewStatus InterviewStatus { get; set; }

        [Required]
        public int InterviewerId { get; set; }

        [ForeignKey("InterviewerId")]
        public Interviewer Interviewer { get; set; }
    }

    public class Interviewer
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public string Role { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
} 