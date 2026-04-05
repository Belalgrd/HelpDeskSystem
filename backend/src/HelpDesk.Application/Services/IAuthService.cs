using HelpDesk.Application.DTOs.Auth;

namespace HelpDesk.Application.Services;

public interface IAuthService
{
    Task<AuthResponseDto?> LoginAsync(LoginRequestDto request);
    Task<AuthResponseDto?> RegisterAsync(RegisterRequestDto request);
    Task<UserDto?> GetCurrentUserAsync(string userId);
    Task<List<UserDto>> GetAgentsAsync();

    // Profile & Settings methods
    Task<UserDto?> UpdateProfileAsync(string userId, UpdateProfileDto dto);
    Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto dto);

    // NEW: Forgot Password methods
    Task<ForgotPasswordResponseDto> ForgotPasswordAsync(ForgotPasswordRequestDto request, string? resetUrlBase = null);
    Task<bool> ResetPasswordAsync(ResetPasswordRequestDto request);
    Task<bool> ValidateResetTokenAsync(ValidateResetTokenRequestDto request);
}