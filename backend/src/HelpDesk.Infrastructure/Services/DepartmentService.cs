using AutoMapper;
using HelpDesk.Application.Common.Interfaces;
using HelpDesk.Application.DTOs.Common;
using HelpDesk.Application.Services;
using HelpDesk.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.Infrastructure.Services;

public class DepartmentService : IDepartmentService
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public DepartmentService(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<DepartmentDto>> GetAllDepartmentsAsync()
    {
        var departments = await _context.Departments
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .ToListAsync();

        return _mapper.Map<List<DepartmentDto>>(departments);
    }

    public async Task<DepartmentDto?> GetDepartmentByIdAsync(Guid id)
    {
        var department = await _context.Departments.FindAsync(id);
        return department == null ? null : _mapper.Map<DepartmentDto>(department);
    }

    public async Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentDto dto)
    {
        var department = _mapper.Map<Department>(dto);
        _context.Departments.Add(department);
        await _context.SaveChangesAsync();

        return _mapper.Map<DepartmentDto>(department);
    }

    public async Task<DepartmentDto?> UpdateDepartmentAsync(Guid id, UpdateDepartmentDto dto)
    {
        var department = await _context.Departments.FindAsync(id);
        if (department == null)
            return null;

        department.Name = dto.Name;
        department.Description = dto.Description;

        await _context.SaveChangesAsync();

        return _mapper.Map<DepartmentDto>(department);
    }

    public async Task<bool> DeleteDepartmentAsync(Guid id)
    {
        var department = await _context.Departments.FindAsync(id);
        if (department == null)
            return false;

        department.IsActive = false;
        await _context.SaveChangesAsync();

        return true;
    }
}