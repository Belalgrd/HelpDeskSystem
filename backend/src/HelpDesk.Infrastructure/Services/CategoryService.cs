using AutoMapper;
using HelpDesk.Application.Common.Interfaces;
using HelpDesk.Application.DTOs.Common;
using HelpDesk.Application.Services;
using HelpDesk.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.Infrastructure.Services;

public class CategoryService : ICategoryService
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public CategoryService(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<CategoryDto>> GetAllCategoriesAsync()
    {
        var categories = await _context.Categories
            .Where(c => c.IsActive)
            .OrderBy(c => c.Name)
            .ToListAsync();

        return _mapper.Map<List<CategoryDto>>(categories);
    }

    public async Task<CategoryDto?> GetCategoryByIdAsync(Guid id)
    {
        var category = await _context.Categories.FindAsync(id);
        return category == null ? null : _mapper.Map<CategoryDto>(category);
    }

    public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto dto)
    {
        var category = _mapper.Map<Category>(dto);
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return _mapper.Map<CategoryDto>(category);
    }

    public async Task<CategoryDto?> UpdateCategoryAsync(Guid id, UpdateCategoryDto dto)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
            return null;

        category.Name = dto.Name;
        category.Description = dto.Description;
        category.Icon = dto.Icon;
        category.Color = dto.Color;
        category.ParentCategoryId = dto.ParentCategoryId;

        await _context.SaveChangesAsync();

        return _mapper.Map<CategoryDto>(category);
    }

    public async Task<bool> DeleteCategoryAsync(Guid id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
            return false;

        category.IsActive = false;
        await _context.SaveChangesAsync();

        return true;
    }
}