using AutoMapper;
using HelpDesk.Application.Common.Models;
using HelpDesk.Application.DTOs.Users;
using HelpDesk.Application.Services;
using HelpDesk.Domain.Entities;
using HelpDesk.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IMapper _mapper;

    public UserService(UserManager<ApplicationUser> userManager, IMapper mapper)
    {
        _userManager = userManager;
        _mapper = mapper;
    }

    public async Task<PaginatedList<UserListDto>> GetUsersAsync(UserFilterDto filter)
    {
        var query = _userManager.Users
            .Include(u => u.Department)
            .AsQueryable();

        // Apply search filter
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var searchLower = filter.Search.ToLower();
            query = query.Where(u =>
                u.FirstName.ToLower().Contains(searchLower) ||
                u.LastName.ToLower().Contains(searchLower) ||
                u.Email!.ToLower().Contains(searchLower));
        }

        // Apply role filter
        if (!string.IsNullOrWhiteSpace(filter.Role) && Enum.TryParse<UserRole>(filter.Role, out var role))
        {
            query = query.Where(u => u.Role == role);
        }

        // Apply department filter
        if (filter.DepartmentId.HasValue)
        {
            query = query.Where(u => u.DepartmentId == filter.DepartmentId);
        }

        // Apply active status filter
        if (filter.IsActive.HasValue)
        {
            query = query.Where(u => u.IsActive == filter.IsActive);
        }

        // Get total count
        var totalCount = await query.CountAsync();

        // Apply pagination and ordering
        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        var dtos = _mapper.Map<List<UserListDto>>(users);

        return new PaginatedList<UserListDto>(dtos, totalCount, filter.Page, filter.PageSize);
    }

    public async Task<UserListDto?> GetUserByIdAsync(string id)
    {
        var user = await _userManager.Users
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Id == id);

        return user == null ? null : _mapper.Map<UserListDto>(user);
    }

    public async Task<UserListDto?> CreateUserAsync(CreateUserDto dto)
    {
        // Check if email already exists
        var existingUser = await _userManager.FindByEmailAsync(dto.Email);
        if (existingUser != null)
            return null;

        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            DepartmentId = dto.DepartmentId,
            Role = Enum.TryParse<UserRole>(dto.Role, out var role) ? role : UserRole.User,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return null;

        // Reload user with department
        user = await _userManager.Users
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Id == user.Id);

        return _mapper.Map<UserListDto>(user);
    }

    public async Task<UserListDto?> UpdateUserAsync(string id, UpdateUserDto dto)
    {
        var user = await _userManager.Users
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return null;

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.DepartmentId = dto.DepartmentId;
        user.IsActive = dto.IsActive;

        if (Enum.TryParse<UserRole>(dto.Role, out var role))
        {
            user.Role = role;
        }

        await _userManager.UpdateAsync(user);

        // Reload user with department
        user = await _userManager.Users
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Id == id);

        return _mapper.Map<UserListDto>(user);
    }

    public async Task<bool> DeleteUserAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return false;

        // Soft delete - just deactivate
        user.IsActive = false;
        await _userManager.UpdateAsync(user);
        return true;
    }

    public async Task<bool> ChangePasswordAsync(string id, string newPassword)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return false;

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
        return result.Succeeded;
    }

    public async Task<bool> ToggleUserStatusAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return false;

        user.IsActive = !user.IsActive;
        await _userManager.UpdateAsync(user);
        return true;
    }
}