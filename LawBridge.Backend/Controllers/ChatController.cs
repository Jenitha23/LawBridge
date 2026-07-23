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
            IsSaved = m.IsSaved,
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


        var message =
            await _chatRepository.GetByIdForUser(id, userId.Value);


        if (message == null)
        {
            return NotFound(new
            {
                message = "Chat message not found"
            });
        }


        return Ok(ToAnswerDto(message));

    }



    // ===========================
    // DELETE: api/chat/history/{id}
    // FR-17 — delete chats
    // ===========================
    [HttpDelete("history/{id}")]
    public async Task<IActionResult> DeleteHistory(int id)
    {

        var userId = await GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                message = "Invalid token."
            });
        }


        var message =
            await _chatRepository.GetByIdForUser(id, userId.Value);

        if (message == null)
        {
            return NotFound(new
            {
                message = "Chat message not found"
            });
        }


        await _chatRepository.Delete(message);


        return Ok(new
        {
            message = "Chat deleted successfully"
        });

    }



    // ===========================
    // PUT: api/chat/history/{id}/save
    // FR-15 — save a useful AI answer
    // ===========================
    [HttpPut("history/{id}/save")]
    public async Task<IActionResult> SetSaved(int id, [FromBody] UpdateSavedDto dto)
    {

        var userId = await GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                message = "Invalid token."
            });
        }


        var message =
            await _chatRepository.GetByIdForUser(id, userId.Value);

        if (message == null)
        {
            return NotFound(new
            {
                message = "Chat message not found"
            });
        }


        message.IsSaved = dto.IsSaved;

        await _chatRepository.Update(message);


        return Ok(new
        {
            message = dto.IsSaved ? "Answer saved" : "Answer removed from saved"
        });

    }



    // ===========================
    // GET: api/chat/saved
    // FR-16 — view saved answers
    // ===========================
    [HttpGet("saved")]
    public async Task<IActionResult> Saved()
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
            await _chatRepository.GetSaved(userId.Value);


        var result = messages.Select(m => new ChatHistoryItemDto
        {
            Id = m.Id,
            Question = m.Question,
            Category = m.Category,
            Language = m.Language,
            IsSaved = m.IsSaved,
            CreatedAt = m.CreatedAt
        }).ToList();


        return Ok(result);

    }



    private static ChatAnswerDto ToAnswerDto(Models.ChatMessage message)
    {

        return new ChatAnswerDto
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
            IsSaved = message.IsSaved,
            NeedsClarification = message.NeedsClarification,
            ClarifyingQuestion = message.ClarifyingQuestion,
            CreatedAt = message.CreatedAt
        };

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
