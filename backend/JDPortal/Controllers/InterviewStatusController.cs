using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JDPortal.Data;
using JDPortal.Models;

namespace JDPortal.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InterviewStatusController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public InterviewStatusController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/InterviewStatus
        [HttpGet]
        public async Task<ActionResult<IEnumerable<InterviewStatus>>> GetInterviewStatuses()
        {
            return await _context.InterviewStatuses
                .Include(i => i.JobDescription)
                .Include(i => i.InterviewerAssignments)
                    .ThenInclude(ia => ia.Interviewer)
                .ToListAsync();
        }

        // GET: api/InterviewStatus/5
        [HttpGet("{id}")]
        public async Task<ActionResult<InterviewStatus>> GetInterviewStatus(int id)
        {
            var interviewStatus = await _context.InterviewStatuses
                .Include(i => i.JobDescription)
                .Include(i => i.InterviewerAssignments)
                    .ThenInclude(ia => ia.Interviewer)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (interviewStatus == null)
            {
                return NotFound();
            }

            return interviewStatus;
        }

        // POST: api/InterviewStatus
        [HttpPost]
        public async Task<ActionResult<InterviewStatus>> CreateInterviewStatus(InterviewStatusCreateDto dto)
        {
            var jobDescription = await _context.JobDescriptions.FindAsync(dto.JobDescriptionId);
            if (jobDescription == null)
            {
                return BadRequest("Invalid JobDescriptionId");
            }

            var interviewStatus = new InterviewStatus
            {
                CandidateName = dto.CandidateName,
                JobDescriptionId = dto.JobDescriptionId,
                InterviewDate = dto.InterviewDate,
                InterviewTime = dto.InterviewTime,
                InterviewType = dto.InterviewType,
                Status = dto.Status,
                Feedback = dto.Feedback,
                CreatedAt = DateTime.UtcNow
            };

            // If candidate is shortlisted, deactivate the job
            if (dto.Status.Equals("Shortlisted", StringComparison.OrdinalIgnoreCase))
            {
                jobDescription.IsActive = false;
                jobDescription.UpdatedAt = DateTime.UtcNow;
                _context.Entry(jobDescription).State = EntityState.Modified;
            }

            _context.InterviewStatuses.Add(interviewStatus);
            await _context.SaveChangesAsync();

            // Add interviewer assignments
            if (dto.AssignedPersonIds != null && dto.AssignedPersonIds.Any())
            {
                var assignments = dto.AssignedPersonIds.Select(interviewerId => new InterviewerAssignment
                {
                    InterviewStatusId = interviewStatus.Id,
                    InterviewerId = interviewerId
                });

                await _context.InterviewerAssignments.AddRangeAsync(assignments);
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetInterviewStatus), new { id = interviewStatus.Id }, interviewStatus);
        }

        // GET: api/InterviewStatus/interviewers
        [HttpGet("interviewers")]
        public async Task<ActionResult<IEnumerable<Interviewer>>> GetInterviewers()
        {
            return await _context.Interviewers.Where(i => i.IsActive).ToListAsync();
        }
    }

    public class InterviewStatusCreateDto
    {
        public string CandidateName { get; set; }
        public int JobDescriptionId { get; set; }
        public DateTime InterviewDate { get; set; }
        public TimeSpan InterviewTime { get; set; }
        public string InterviewType { get; set; }
        public string Status { get; set; }
        public string Feedback { get; set; }
        public List<int> AssignedPersonIds { get; set; }
    }
} 