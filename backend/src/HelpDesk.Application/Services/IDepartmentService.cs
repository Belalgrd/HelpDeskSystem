using HelpDesk.Application.DTOs.Common;

namespace HelpDesk.Application.Services;

public interface IDepartmentService
{
    Task<List<DepartmentDto>> GetAllDepartmentsAsync();
    Task<DepartmentDto?> GetDepartmentByIdAsync(Guid id);
    Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentDto dto);
    Task<DepartmentDto?> UpdateDepartmentAsync(Guid id, UpdateDepartmentDto dto);
    Task<bool> DeleteDepartmentAsync(Guid id);
}