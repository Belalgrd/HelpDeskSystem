using HelpDesk.Application.Common.Models;
using HelpDesk.Application.DTOs.Common;
using HelpDesk.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelpDesk.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<CategoryDto>>>> GetCategories()
    {
        var categories = await _categoryService.GetAllCategoriesAsync();
        return Ok(ApiResponse<List<CategoryDto>>.SuccessResponse(categories));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> GetCategory(Guid id)
    {
        var category = await _categoryService.GetCategoryByIdAsync(id);

        if (category == null)
            return NotFound(ApiResponse<CategoryDto>.ErrorResponse("Category not found"));

        return Ok(ApiResponse<CategoryDto>.SuccessResponse(category));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> CreateCategory([FromBody] CreateCategoryDto dto)
    {
        var category = await _categoryService.CreateCategoryAsync(dto);
        return CreatedAtAction(nameof(GetCategory), new { id = category.Id },
            ApiResponse<CategoryDto>.SuccessResponse(category, "Category created successfully"));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> UpdateCategory(Guid id, [FromBody] UpdateCategoryDto dto)
    {
        var category = await _categoryService.UpdateCategoryAsync(id, dto);

        if (category == null)
            return NotFound(ApiResponse<CategoryDto>.ErrorResponse("Category not found"));

        return Ok(ApiResponse<CategoryDto>.SuccessResponse(category, "Category updated successfully"));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteCategory(Guid id)
    {
        var result = await _categoryService.DeleteCategoryAsync(id);

        if (!result)
            return NotFound(ApiResponse<bool>.ErrorResponse("Category not found"));

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Category deleted successfully"));
    }
}