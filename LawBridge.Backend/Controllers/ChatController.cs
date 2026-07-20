using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LawBridge.Backend.DTOs.Chat;
using LawBridge.Backend.Interfaces;
using LawBridge.Backend.Services;

namespace LawBridge.Backend.Controllers;


[ApiController]
[Route("api/chat")]
[Authorize]
public class ChatController : ControllerBase
{

    private readonly LegalChatService _chatService;
    private readonly IChatRepository _chatRepository;
    private readonly IUserRepository _userRepository;


    public ChatController(
        LegalChatService chatService,
        IChatRepository chatRepository,
        IUserRepository userRepository
    )
    {
        _chatService = chatService;
        _chatRepository = chatRepository;
        _userRepository = userRepository;
    }



    // ===========================
    // POST: api/chat/ask
    // FR-04, FR-05, FR-06, FR-07, FR-08
    // ===========================
    [HttpPost("ask")]
    public async Task<IActionResult> Ask([FromBody] AskQuestionDto dto)
    {

        if (string.IsNullOrWhiteSpace(dto.Question))
        {
            return BadRequest(new
            {
                message = "Please enter a question."
            });
        }


        var userId = await GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                message = "Invalid token."
            });
        }


        try
        {

            var answer =
                await _chatService.Ask(userId.Value, dto);

            return Ok(answer);

        }
        catch (HttpRequestException)
        {

            return StatusCode(503, new
            {
                message = "The AI assistant is unavailable right now. Please make sure Ollama is running and try again."
            });

        }

    }



    // ===========================
    // GET: api/chat/history
    // ===========================
    [HttpGet("history")]
    public async Task<IActionResult> History()
    {

        var userId = await GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                message = "Invalid token."
            });
        }


        var messages =
            await _chatRepository.GetByUser(userId.Value);


        var result = messages.Select(m => new ChatHistoryItemDto
        {
            Id = m.Id,
            Question = m.Question,
            Category = m.Category,
            Language = m.Language,
            CreatedAt = m.CreatedAt
        }).ToList();


        return Ok(result);

    }



    // ===========================
    // GET: api/chat/history/{id}
    // Full stored answer for a past question.
    // ===========================
    [HttpGet("history/{id}")]
    public async Task<IActionResult> HistoryDetail(int id)
    {

        var userId = await GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                message = "Invalid token."
            });
        }


        var messages =
            await _chatRepository.GetByUser(userId.Value);

        var message =
            messages.FirstOrDefault(m => m.Id == id);


        if (message == null)
        {
            return NotFound(new
            {
                message = "Chat message not found"
            });
        }


        var result = new ChatAnswerDto
        {
            Id = message.Id,
            Question = message.Question,
            Language = message.Language,
            Category = message.Category,
            Explanation = message.Explanation,
            RelevantLegalInfo = message.RelevantLegalInfo,
            PossibleActions = JsonSerializer.Deserialize<List<string>>(message.PossibleActions) ?? new(),
            RequiredDocuments = JsonSerializer.Deserialize<List<string>>(message.RequiredDocuments) ?? new(),
            WhenToConsultLawyer = message.WhenToConsultLawyer,
            Sources = JsonSerializer.Deserialize<List<string>>(message.SourceDocuments) ?? new(),
            CreatedAt = message.CreatedAt
        };


        return Ok(result);

    }



    private async Task<int?> GetUserId()
    {

        var email = User.FindFirst(ClaimTypes.Email)?.Value;

        if (string.IsNullOrEmpty(email))
        {
            return null;
        }


        var user =
            await _userRepository.GetByEmailAsync(email);


        return user?.Id;

    }

}
