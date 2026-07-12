using Microsoft.EntityFrameworkCore;
using LawBridge.Backend.Data;
using LawBridge.Backend.DTOs.Dashboard;
using LawBridge.Backend.Interfaces;


namespace LawBridge.Backend.Services;


public class AdminDashboardService 
    : IAdminDashboardService
{

    private readonly AppDbContext _context;


    public AdminDashboardService(
        AppDbContext context
    )
    {
        _context = context;
    }



    public async Task<DashboardStatsDto> GetStats()
    {

        var totalUsers =
            await _context.Users.CountAsync();



        var totalDocuments =
            await _context.LegalDocuments.CountAsync();



        var totalCategories =
            await _context.LegalCategories.CountAsync();



        return new DashboardStatsDto
        {

            TotalUsers = totalUsers,

            TotalDocuments = totalDocuments,

            TotalCategories = totalCategories,


            // AI chat will implement later
            TotalChatSessions = 0,


            // File storage calculation later
            StorageUsedMB = 0

        };

    }

}