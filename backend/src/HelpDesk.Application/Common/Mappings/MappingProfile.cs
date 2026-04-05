using AutoMapper;
using HelpDesk.Application.DTOs.Users;
using HelpDesk.Application.DTOs.Auth;
using HelpDesk.Application.DTOs.Common;
using HelpDesk.Application.DTOs.Tickets;
using HelpDesk.Domain.Entities;

namespace HelpDesk.Application.Common.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User mappings
        CreateMap<ApplicationUser, UserDto>()
            .ForMember(d => d.FullName, opt => opt.MapFrom(s => s.FullName))
            .ForMember(d => d.Role, opt => opt.MapFrom(s => s.Role.ToString()))
            .ForMember(d => d.DepartmentName, opt => opt.MapFrom(s => s.Department != null ? s.Department.Name : null));

        // User List mappings
        CreateMap<ApplicationUser, UserListDto>()
            .ForMember(d => d.FullName, opt => opt.MapFrom(s => s.FullName))
            .ForMember(d => d.Role, opt => opt.MapFrom(s => s.Role.ToString()))
            .ForMember(d => d.DepartmentName, opt => opt.MapFrom(s => s.Department != null ? s.Department.Name : null));

        // Ticket mappings
        CreateMap<Ticket, TicketDto>()
            .ForMember(d => d.CategoryName, opt => opt.MapFrom(s => s.Category.Name))
            .ForMember(d => d.DepartmentName, opt => opt.MapFrom(s => s.Department.Name))
            .ForMember(d => d.RequesterName, opt => opt.MapFrom(s => s.Requester.FullName))
            .ForMember(d => d.RequesterAvatar, opt => opt.MapFrom(s => s.Requester.AvatarUrl))
            .ForMember(d => d.AssigneeName, opt => opt.MapFrom(s => s.Assignee != null ? s.Assignee.FullName : null))
            .ForMember(d => d.AssigneeAvatar, opt => opt.MapFrom(s => s.Assignee != null ? s.Assignee.AvatarUrl : null))
            .ForMember(d => d.CommentsCount, opt => opt.MapFrom(s => s.Comments.Count))
            .ForMember(d => d.AttachmentsCount, opt => opt.MapFrom(s => s.Attachments.Count));

        CreateMap<Ticket, TicketDetailDto>()
            .ForMember(d => d.CategoryName, opt => opt.MapFrom(s => s.Category.Name))
            .ForMember(d => d.DepartmentName, opt => opt.MapFrom(s => s.Department.Name))
            .ForMember(d => d.RequesterName, opt => opt.MapFrom(s => s.Requester.FullName))
            .ForMember(d => d.RequesterEmail, opt => opt.MapFrom(s => s.Requester.Email))
            .ForMember(d => d.RequesterAvatar, opt => opt.MapFrom(s => s.Requester.AvatarUrl))
            .ForMember(d => d.AssigneeName, opt => opt.MapFrom(s => s.Assignee != null ? s.Assignee.FullName : null))
            .ForMember(d => d.AssigneeAvatar, opt => opt.MapFrom(s => s.Assignee != null ? s.Assignee.AvatarUrl : null))
            .ForMember(d => d.CommentsCount, opt => opt.MapFrom(s => s.Comments.Count))
            .ForMember(d => d.AttachmentsCount, opt => opt.MapFrom(s => s.Attachments.Count));

        // Comment mappings
        CreateMap<Comment, CommentDto>()
            .ForMember(d => d.UserName, opt => opt.MapFrom(s => s.User.FullName))
            .ForMember(d => d.UserAvatar, opt => opt.MapFrom(s => s.User.AvatarUrl));

        // Attachment mappings
        CreateMap<Attachment, AttachmentDto>()
            .ForMember(d => d.DownloadUrl, opt => opt.MapFrom(s => $"/api/attachments/{s.Id}"));

        // History mappings
        CreateMap<TicketHistory, TicketHistoryDto>()
            .ForMember(d => d.UserName, opt => opt.MapFrom(s => s.User.FullName));

        // Department mappings
        CreateMap<Department, DepartmentDto>();
        CreateMap<CreateDepartmentDto, Department>();
        CreateMap<UpdateDepartmentDto, Department>();

        // Category mappings
        CreateMap<Category, CategoryDto>();
        CreateMap<CreateCategoryDto, Category>();
        CreateMap<UpdateCategoryDto, Category>();
    }
}