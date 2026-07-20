using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LawBridge.Backend.Data;
using LawBridge.Backend.Models;
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



    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
    {

        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new
            {
                message = "Category name is required"
            });
        }


        var exists = await _context.LegalCategories
            .AnyAsync(c => c.Name.ToLower() == dto.Name.Trim().ToLower());

        if (exists)
        {
            return BadRequest(new
            {
                message = $"A category named '{dto.Name}' already exists."
            });
        }


        var category = new LegalCategory
        {
            Name = dto.Name.Trim(),
            Description = dto.Description
        };


        _context.LegalCategories.Add(category);

        await _context.SaveChangesAsync();


        return Ok(new LegalCategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            DocumentCount = 0
        });

    }



    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCategoryDto dto)
    {

        var category =
            await _context.LegalCategories.FindAsync(id);


        if (category == null)
        {
            return NotFound(new
            {
                message = "Category not found"
            });
        }


        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new
            {
                message = "Category name is required"
            });
        }


        var nameTaken = await _context.LegalCategories
            .AnyAsync(c => c.Id != id && c.Name.ToLower() == dto.Name.Trim().ToLower());

        if (nameTaken)
        {
            return BadRequest(new
            {
                message = $"A category named '{dto.Name}' already exists."
            });
        }


        category.Name = dto.Name.Trim();
        category.Description = dto.Description;


        await _context.SaveChangesAsync();


        return Ok(new
        {
            message = "Category updated successfully"
        });

    }



    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {

        var category = await _context.LegalCategories
            .Include(c => c.LegalDocuments)
            .FirstOrDefaultAsync(c => c.Id == id);


        if (category == null)
        {
            return NotFound(new
            {
                message = "Category not found"
            });
        }


        if (category.LegalDocuments.Count > 0)
        {
            return BadRequest(new
            {
                message = $"Cannot delete '{category.Name}' — {category.LegalDocuments.Count} document(s) are assigned to it."
            });
        }


        _context.LegalCategories.Remove(category);

        await _context.SaveChangesAsync();


        return Ok(new
        {
            message = "Category deleted successfully"
        });

    }

}
