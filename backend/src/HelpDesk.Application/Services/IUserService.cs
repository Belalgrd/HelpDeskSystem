using HelpDesk.Application.Common.Models;
using HelpDesk.Application.DTOs.Users;

namespace HelpDesk.Application.Services;

public interface IUserService
{
    Task<PaginatedList<UserListDto>> GetUsersAsync(UserFilterDto filter);
    Task<UserListDto?> GetUserByIdAsync(string id);
    Task<UserListDto?> CreateUserAsync(CreateUserDto dto);
    Task<UserListDto?> UpdateUserAsync(string id, UpdateUserDto dto);
    Task<bool> DeleteUserAsync(string id);
    Task<bool> ChangePasswordAsync(string id, string newPassword);
    Task<bool> ToggleUserStatusAsync(string id);
}