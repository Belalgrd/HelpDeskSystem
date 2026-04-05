using HelpDesk.Application.Common.Models;
using HelpDesk.Application.DTOs.Auth;
using HelpDesk.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HelpDesk.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IConfiguration _configuration;

    public AuthController(IAuthService authService, IConfiguration configuration)
    {
        _authService = authService;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login([FromBody] LoginRequestDto request)
    {
        var result = await _authService.LoginAsync(request);

        if (result == null)
            return Unauthorized(ApiResponse<AuthResponseDto>.ErrorResponse("Invalid email or password"));

        return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(result, "Login successful"));
    }

    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Register([FromBody] RegisterRequestDto request)
    {
        var result = await _authService.RegisterAsync(request);

        if (result == null)
            return BadRequest(ApiResponse<AuthResponseDto>.ErrorResponse("Registration failed. Email may already be registered."));

        return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(result, "Registration successful"));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<UserDto>.ErrorResponse("User not authenticated"));

        var user = await _authService.GetCurrentUserAsync(userId);

        if (user == null)
            return NotFound(ApiResponse<UserDto>.ErrorResponse("User not found"));

        return Ok(ApiResponse<UserDto>.SuccessResponse(user));
    }

    [Authorize]
    [HttpGet("agents")]
    public async Task<ActionResult<ApiResponse<List<UserDto>>>> GetAgents()
    {
        var agents = await _authService.GetAgentsAsync();
        return Ok(ApiResponse<List<UserDto>>.SuccessResponse(agents));
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult<ApiResponse<UserDto>>> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<UserDto>.ErrorResponse("User not authenticated"));

        var user = await _authService.UpdateProfileAsync(userId, dto);

        if (user == null)
            return NotFound(ApiResponse<UserDto>.ErrorResponse("User not found"));

        return Ok(ApiResponse<UserDto>.SuccessResponse(user, "Profile updated successfully"));
    }

    [Authorize]
    [HttpPut("change-password")]
    public async Task<ActionResult<ApiResponse<bool>>> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<bool>.ErrorResponse("User not authenticated"));

        var result = await _authService.ChangePasswordAsync(userId, dto);

        if (!result)
            return BadRequest(ApiResponse<bool>.ErrorResponse("Failed to change password. Please check your current password."));

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Password changed successfully"));
    }

    // NEW: Forgot Password
    [HttpPost("forgot-password")]
    public async Task<ActionResult<ApiResponse<ForgotPasswordResponseDto>>> ForgotPassword([FromBody] ForgotPasswordRequestDto request)
    {
        // Get frontend URL from configuration
        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";
        var resetUrlBase = $"{frontendUrl}/reset-password";

        var result = await _authService.ForgotPasswordAsync(request, resetUrlBase);

        return Ok(ApiResponse<ForgotPasswordResponseDto>.SuccessResponse(result, result.Message));
    }

    // NEW: Reset Password
    [HttpPost("reset-password")]
    public async Task<ActionResult<ApiResponse<bool>>> ResetPassword([FromBody] ResetPasswordRequestDto request)
    {
        var result = await _authService.ResetPasswordAsync(request);

        if (!result)
            return BadRequest(ApiResponse<bool>.ErrorResponse("Failed to reset password. The link may have expired or is invalid."));

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Password reset successfully. You can now login with your new password."));
    }

    // NEW: Validate Reset Token
    [HttpPost("validate-reset-token")]
    public async Task<ActionResult<ApiResponse<bool>>> ValidateResetToken([FromBody] ValidateResetTokenRequestDto request)
    {
        var isValid = await _authService.ValidateResetTokenAsync(request);

        if (!isValid)
            return BadRequest(ApiResponse<bool>.ErrorResponse("Invalid or expired reset token."));

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Token is valid."));
    }
}