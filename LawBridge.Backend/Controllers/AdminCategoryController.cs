using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LawBridge.Backend.Data;
using LawBridge.Backend.DTOs.Documents;

namespace LawBridge.Backend.Controllers;


[ApiController]
[Route("api/admin/categories")]
[Authorize(Roles = "Admin")]
public class AdminCategoryController : ControllerBase
{

    private readonly AppDbContext _context;


    public AdminCategoryController(
        AppDbContext context
    )
    {
        _context = context;
    }



    [HttpGet]
    public async Task<IActionResult> GetAll()
    {

        var categories = await _context.LegalCategories
            .Select(c => new LegalCategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                DocumentCount = c.LegalDocuments.Count
            })
            .OrderBy(c => c.Name)
            .ToListAsync();


        return Ok(categories);

    }

}
