using HelpDesk.Application.Common.Models;
using HelpDesk.Application.DTOs.Users;
using HelpDesk.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelpDesk.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PaginatedList<UserListDto>>>> GetUsers(
        [FromQuery] string? search,
        [FromQuery] string? role,
        [FromQuery] Guid? departmentId,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var filter = new UserFilterDto
        {
            Search = search,
            Role = role,
            DepartmentId = departmentId,
            IsActive = isActive,
            Page = page,
            PageSize = pageSize
        };

        var result = await _userService.GetUsersAsync(filter);
        return Ok(ApiResponse<PaginatedList<UserListDto>>.SuccessResponse(result));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<UserListDto>>> GetUser(string id)
    {
        var user = await _userService.GetUserByIdAsync(id);

        if (user == null)
            return NotFound(ApiResponse<UserListDto>.ErrorResponse("User not found"));

        return Ok(ApiResponse<UserListDto>.SuccessResponse(user));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<UserListDto>>> CreateUser([FromBody] CreateUserDto dto)
    {
        var result = await _userService.CreateUserAsync(dto);

        if (result == null)
            return BadRequest(ApiResponse<UserListDto>.ErrorResponse("Failed to create user. Email may already be registered."));

        return CreatedAtAction(nameof(GetUser), new { id = result.Id },
            ApiResponse<UserListDto>.SuccessResponse(result, "User created successfully"));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<UserListDto>>> UpdateUser(string id, [FromBody] UpdateUserDto dto)
    {
        var result = await _userService.UpdateUserAsync(id, dto);

        if (result == null)
            return NotFound(ApiResponse<UserListDto>.ErrorResponse("User not found"));

        return Ok(ApiResponse<UserListDto>.SuccessResponse(result, "User updated successfully"));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteUser(string id)
    {
        var result = await _userService.DeleteUserAsync(id);

        if (!result)
            return NotFound(ApiResponse<bool>.ErrorResponse("User not found"));

        return Ok(ApiResponse<bool>.SuccessResponse(true, "User deactivated successfully"));
    }

    [HttpPost("{id}/reset-password")]
    public async Task<ActionResult<ApiResponse<bool>>> ResetPassword(string id, [FromBody] ChangePasswordDto dto)
    {
        var result = await _userService.ChangePasswordAsync(id, dto.NewPassword);

        if (!result)
            return BadRequest(ApiResponse<bool>.ErrorResponse("Failed to reset password"));

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Password reset successfully"));
    }

    [HttpPatch("{id}/toggle-status")]
    public async Task<ActionResult<ApiResponse<UserListDto>>> ToggleUserStatus(string id)
    {
        var success = await _userService.ToggleUserStatusAsync(id);

        if (!success)
            return NotFound(ApiResponse<UserListDto>.ErrorResponse("User not found"));

        var user = await _userService.GetUserByIdAsync(id);
        return Ok(ApiResponse<UserListDto>.SuccessResponse(user!,
            user!.IsActive ? "User activated successfully" : "User deactivated successfully"));
    }
}