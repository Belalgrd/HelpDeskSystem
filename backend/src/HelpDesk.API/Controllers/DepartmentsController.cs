using AutoMapper;
using HelpDesk.Application.Common.Interfaces;
using HelpDesk.Application.Common.Models;
using HelpDesk.Application.DTOs.Common;
using HelpDesk.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DepartmentsController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public DepartmentsController(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    // PUBLIC: Get all departments (for registration form)
    [HttpGet("public")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<List<DepartmentDto>>>> GetPublicDepartments()
    {
        var departments = await _context.Departments
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .Select(d => new DepartmentDto
            {
                Id = d.Id,
                Name = d.Name,
                Description = d.Description
            })
            .ToListAsync();

        return Ok(ApiResponse<List<DepartmentDto>>.SuccessResponse(departments));
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<DepartmentDto>>>> GetDepartments()
    {
        var departments = await _context.Departments
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .ToListAsync();

        var dtos = _mapper.Map<List<DepartmentDto>>(departments);
        return Ok(ApiResponse<List<DepartmentDto>>.SuccessResponse(dtos));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<DepartmentDto>>> GetDepartment(Guid id)
    {
        var department = await _context.Departments.FindAsync(id);

        if (department == null)
            return NotFound(ApiResponse<DepartmentDto>.ErrorResponse("Department not found"));

        var dto = _mapper.Map<DepartmentDto>(department);
        return Ok(ApiResponse<DepartmentDto>.SuccessResponse(dto));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<DepartmentDto>>> CreateDepartment([FromBody] CreateDepartmentDto dto)
    {
        var department = _mapper.Map<Department>(dto);
        _context.Departments.Add(department);
        await _context.SaveChangesAsync();

        var result = _mapper.Map<DepartmentDto>(department);
        return CreatedAtAction(nameof(GetDepartment), new { id = department.Id },
            ApiResponse<DepartmentDto>.SuccessResponse(result, "Department created successfully"));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<DepartmentDto>>> UpdateDepartment(Guid id, [FromBody] CreateDepartmentDto dto)
    {
        var department = await _context.Departments.FindAsync(id);

        if (department == null)
            return NotFound(ApiResponse<DepartmentDto>.ErrorResponse("Department not found"));

        department.Name = dto.Name;
        department.Description = dto.Description;
        await _context.SaveChangesAsync();

        var result = _mapper.Map<DepartmentDto>(department);
        return Ok(ApiResponse<DepartmentDto>.SuccessResponse(result, "Department updated successfully"));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteDepartment(Guid id)
    {
        var department = await _context.Departments.FindAsync(id);

        if (department == null)
            return NotFound(ApiResponse<bool>.ErrorResponse("Department not found"));

        department.IsActive = false;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Department deleted successfully"));
    }
}