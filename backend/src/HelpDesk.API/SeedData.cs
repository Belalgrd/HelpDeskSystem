using HelpDesk.Domain.Entities;
using HelpDesk.Domain.Enums;
using HelpDesk.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

public static class SeedData
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        var context = serviceProvider.GetRequiredService<ApplicationDbContext>();
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        // Seed Departments
        if (!await context.Departments.AnyAsync())
        {
            var departments = new List<Department>
            {
                new() { Name = "IT Support", Description = "Technical support and IT issues" },
                new() { Name = "HR", Description = "Human Resources department" },
                new() { Name = "Finance", Description = "Finance and accounting" },
                new() { Name = "Operations", Description = "Operations and logistics" },
                new() { Name = "Customer Service", Description = "Customer service department" }
            };
            context.Departments.AddRange(departments);
            await context.SaveChangesAsync();
        }

        // Seed Categories
        if (!await context.Categories.AnyAsync())
        {
            var categories = new List<Category>
            {
                new() { Name = "Hardware", Description = "Hardware related issues", Icon = "ti-device-desktop", Color = "#3b82f6" },
                new() { Name = "Software", Description = "Software and application issues", Icon = "ti-apps", Color = "#10b981" },
                new() { Name = "Network", Description = "Network and connectivity issues", Icon = "ti-network", Color = "#f59e0b" },
                new() { Name = "Email", Description = "Email and communication issues", Icon = "ti-mail", Color = "#8b5cf6" },
                new() { Name = "Security", Description = "Security related issues", Icon = "ti-shield", Color = "#ef4444" },
                new() { Name = "Other", Description = "Other issues", Icon = "ti-help", Color = "#6b7280" }
            };
            context.Categories.AddRange(categories);
            await context.SaveChangesAsync();
        }

        // Seed Admin User
        var adminEmail = "admin@helpdesk.com";
        if (await userManager.FindByEmailAsync(adminEmail) == null)
        {
            var department = await context.Departments.FirstAsync();
            var admin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FirstName = "Admin",
                LastName = "User",
                Role = UserRole.Admin,
                DepartmentId = department.Id,
                EmailConfirmed = true,
                IsActive = true
            };
            await userManager.CreateAsync(admin, "Admin@123");
        }

        // Seed Agent User
        var agentEmail = "agent@helpdesk.com";
        if (await userManager.FindByEmailAsync(agentEmail) == null)
        {
            var department = await context.Departments.FirstAsync();
            var agent = new ApplicationUser
            {
                UserName = agentEmail,
                Email = agentEmail,
                FirstName = "Support",
                LastName = "Agent",
                Role = UserRole.Agent,
                DepartmentId = department.Id,
                EmailConfirmed = true,
                IsActive = true
            };
            await userManager.CreateAsync(agent, "Agent@123");
        }

        // Seed Regular User
        var userEmail = "user@helpdesk.com";
        if (await userManager.FindByEmailAsync(userEmail) == null)
        {
            var department = await context.Departments.Skip(1).FirstAsync();
            var user = new ApplicationUser
            {
                UserName = userEmail,
                Email = userEmail,
                FirstName = "John",
                LastName = "Doe",
                Role = UserRole.User,
                DepartmentId = department.Id,
                EmailConfirmed = true,
                IsActive = true
            };
            await userManager.CreateAsync(user, "User@123");
        }
    }
}