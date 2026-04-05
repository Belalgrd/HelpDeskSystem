using AutoMapper;
using HelpDesk.Application.DTOs.Auth;
using HelpDesk.Application.Services;
using HelpDesk.Domain.Entities;
using HelpDesk.Domain.Enums;
using HelpDesk.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Web;

namespace HelpDesk.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IJwtService _jwtService;
    private readonly IEmailService _emailService;
    private readonly IMapper _mapper;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IJwtService jwtService,
        IEmailService emailService,
        IMapper mapper,
        ILogger<AuthService> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtService = jwtService;
        _emailService = emailService;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginRequestDto request)
    {
        var user = await _userManager.Users
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || !user.IsActive)
            return null;

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);

        if (!result.Succeeded)
            return null;

        var token = _jwtService.GenerateToken(user);

        return new AuthResponseDto
        {
            Token = token,
            Expiration = DateTime.UtcNow.AddDays(7),
            User = _mapper.Map<UserDto>(user)
        };
    }

    public async Task<AuthResponseDto?> RegisterAsync(RegisterRequestDto request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
            return null;

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            DepartmentId = request.DepartmentId,
            Role = UserRole.User,
            IsActive = true
        };

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            _logger.LogWarning("User registration failed for {Email}: {Errors}",
                request.Email,
                string.Join(", ", result.Errors.Select(e => e.Description)));
            return null;
        }

        // Send welcome email (don't block on failure)
        try
        {
            await _emailService.SendWelcomeEmailAsync(user.Email!, user.FullName);
            _logger.LogInformation("Welcome email sent to {Email}", user.Email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send welcome email to {Email}", user.Email);
        }

        var token = _jwtService.GenerateToken(user);

        return new AuthResponseDto
        {
            Token = token,
            Expiration = DateTime.UtcNow.AddDays(7),
            User = _mapper.Map<UserDto>(user)
        };
    }

    public async Task<UserDto?> GetCurrentUserAsync(string userId)
    {
        var user = await _userManager.Users
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Id == userId);

        return user == null ? null : _mapper.Map<UserDto>(user);
    }

    public async Task<List<UserDto>> GetAgentsAsync()
    {
        var agents = await _userManager.Users
            .Include(u => u.Department)
            .Where(u => u.Role == UserRole.Agent || u.Role == UserRole.Supervisor || u.Role == UserRole.Admin)
            .Where(u => u.IsActive)
            .OrderBy(u => u.Role)
            .ThenBy(u => u.FirstName)
            .ThenBy(u => u.LastName)
            .ToListAsync();

        return _mapper.Map<List<UserDto>>(agents.DistinctBy(a => a.Id).ToList());
    }

    public async Task<UserDto?> UpdateProfileAsync(string userId, UpdateProfileDto dto)
    {
        var user = await _userManager.Users
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return null;

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;

        if (!string.IsNullOrEmpty(dto.AvatarUrl))
        {
            user.AvatarUrl = dto.AvatarUrl;
        }

        await _userManager.UpdateAsync(user);

        user = await _userManager.Users
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Id == userId);

        return _mapper.Map<UserDto>(user);
    }

    public async Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return false;

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        return result.Succeeded;
    }

    public async Task<ForgotPasswordResponseDto> ForgotPasswordAsync(ForgotPasswordRequestDto request, string? resetUrlBase = null)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        // Always return success to prevent email enumeration attacks
        if (user == null || !user.IsActive)
        {
            _logger.LogWarning("Password reset requested for non-existent or inactive email: {Email}", request.Email);
            return new ForgotPasswordResponseDto
            {
                Success = true,
                Message = "If your email is registered, you will receive a password reset link shortly."
            };
        }

        // Generate password reset token using Identity
        var token = await _userManager.GeneratePasswordResetTokenAsync(user);

        // URL encode the token for safe transmission
        var encodedToken = HttpUtility.UrlEncode(token);
        var encodedEmail = HttpUtility.UrlEncode(request.Email);

        // Build reset URL
        var resetUrl = string.IsNullOrEmpty(resetUrlBase)
            ? $"/reset-password?token={encodedToken}&email={encodedEmail}"
            : $"{resetUrlBase}?token={encodedToken}&email={encodedEmail}";

        _logger.LogInformation("Password reset token generated for user: {Email}", request.Email);

        // Send password reset email
        try
        {
            var emailSent = await _emailService.SendPasswordResetEmailAsync(user.Email!, user.FullName, resetUrl);

            if (emailSent)
            {
                _logger.LogInformation("Password reset email sent to: {Email}", request.Email);
            }
            else
            {
                _logger.LogWarning("Failed to send password reset email to: {Email}", request.Email);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending password reset email to: {Email}", request.Email);
        }

        return new ForgotPasswordResponseDto
        {
            Success = true,
            Message = "If your email is registered, you will receive a password reset link shortly."
        };
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        if (user == null || !user.IsActive)
        {
            _logger.LogWarning("Password reset attempted for non-existent or inactive email: {Email}", request.Email);
            return false;
        }

        // URL decode the token if it was encoded
        var decodedToken = HttpUtility.UrlDecode(request.Token);

        var result = await _userManager.ResetPasswordAsync(user, decodedToken, request.NewPassword);

        if (result.Succeeded)
        {
            _logger.LogInformation("Password successfully reset for user: {Email}", request.Email);
            return true;
        }

        // Log errors for debugging
        foreach (var error in result.Errors)
        {
            _logger.LogWarning("Password reset failed for {Email}: {Error}", request.Email, error.Description);
        }

        return false;
    }

    public async Task<bool> ValidateResetTokenAsync(ValidateResetTokenRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        if (user == null || !user.IsActive)
            return false;

        // URL decode the token if it was encoded
        var decodedToken = HttpUtility.UrlDecode(request.Token);

        // Verify token by attempting to generate a password reset token purpose validation
        var tokenProvider = _userManager.Options.Tokens.PasswordResetTokenProvider;
        var isValid = await _userManager.VerifyUserTokenAsync(
            user,
            tokenProvider,
            "ResetPassword",
            decodedToken
        );

        return isValid;
    }
}