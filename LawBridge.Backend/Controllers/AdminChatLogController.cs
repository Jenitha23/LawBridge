using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using LawBridge.Backend.Data;
using LawBridge.Backend.DTOs.Admin;

namespace LawBridge.Backend.Controllers;


[ApiController]
[Route("api/admin/chat-logs")]
[Authorize(Roles = "Admin")]
public class AdminChatLogController : ControllerBase
{

    private readonly AppDbContext _context;


    public AdminChatLogController(AppDbContext context)
    {
        _context = context;
    }



    // ===========================
    // GET: api/admin/chat-logs?search=&category=
    // ===========================
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? category
    )
    {

        var query =
            from m in _context.ChatMessages
            join u in _context.Users on m.UserId equals u.Id
            select new { m, u };


        if (!string.IsNullOrWhiteSpace(search))
        {

            var term = search.Trim();

            query = query.Where(x =>
                EF.Functions.ILike(x.m.Question, $"%{term}%") ||
                EF.Functions.ILike(x.u.Name, $"%{term}%") ||
                EF.Functions.ILike(x.u.Email, $"%{term}%"));

        }


        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(x => x.m.Category == category);
        }


        var results = await query
            .OrderByDescending(x => x.m.CreatedAt)
            .Select(x => new AdminChatLogListItemDto
            {
                Id = x.m.Id,
                UserName = x.u.Name,
                UserEmail = x.u.Email,
                Question = x.m.Question,
                Category = x.m.Category,
                Language = x.m.Language,
                CreatedAt = x.m.CreatedAt
            })
            .Take(200)
            .ToListAsync();


        return Ok(results);

    }



    // ===========================
    // GET: api/admin/chat-logs/{id}
    // ===========================
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {

        var record = await (
            from m in _context.ChatMessages
            join u in _context.Users on m.UserId equals u.Id
            where m.Id == id
            select new { m, u }
        ).FirstOrDefaultAsync();


        if (record == null)
        {
            return NotFound(new { message = "Chat log not found" });
        }


        var result = new AdminChatLogDetailDto
        {
            Id = record.m.Id,
            UserName = record.u.Name,
            UserEmail = record.u.Email,
            Question = record.m.Question,
            Language = record.m.Language,
            Category = record.m.Category,
            Explanation = record.m.Explanation,
            RelevantLegalInfo = record.m.RelevantLegalInfo,
            PossibleActions = JsonSerializer.Deserialize<List<string>>(record.m.PossibleActions) ?? new(),
            RequiredDocuments = JsonSerializer.Deserialize<List<string>>(record.m.RequiredDocuments) ?? new(),
            WhenToConsultLawyer = record.m.WhenToConsultLawyer,
            Sources = JsonSerializer.Deserialize<List<string>>(record.m.SourceDocuments) ?? new(),
            CreatedAt = record.m.CreatedAt
        };


        return Ok(result);

    }

}
