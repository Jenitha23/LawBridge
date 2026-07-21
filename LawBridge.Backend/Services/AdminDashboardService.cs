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



        // ---- Documents by category ----
        var categoryBreakdown = await _context.LegalCategories
            .Select(c => new CategoryBreakdownDto
            {
                Name = c.Name,
                Count = c.LegalDocuments.Count
            })
            .OrderByDescending(c => c.Count)
            .ToListAsync();

        foreach (var c in categoryBreakdown)
        {
            c.Percent = totalDocuments > 0
                ? Math.Round((double)c.Count / totalDocuments * 100, 1)
                : 0;
        }



        // ---- Recent documents (last 5 uploaded) ----
        var recentDocuments = await _context.LegalDocuments
            .OrderByDescending(d => d.CreatedAt)
            .Take(5)
            .Select(d => new RecentDocumentDto
            {
                Title = d.Title,
                CategoryName = d.Category.Name,
                CreatedAt = d.CreatedAt
            })
            .ToListAsync();



        // ---- User registrations, last 12 days ----
        var since = DateTime.UtcNow.Date.AddDays(-11);

        var registrationsRaw = await _context.Users
            .Where(u => u.CreatedAt >= since)
            .GroupBy(u => u.CreatedAt.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToListAsync();

        var registrationTrend = new List<RegistrationPointDto>();
        for (var day = since; day <= DateTime.UtcNow.Date; day = day.AddDays(1))
        {
            var match = registrationsRaw.FirstOrDefault(r => r.Date == day);
            registrationTrend.Add(new RegistrationPointDto
            {
                Date = day,
                Count = match?.Count ?? 0
            });
        }



        // ---- Storage used: sum of actual file sizes on disk ----
        double storageUsedMB = 0;
        var uploadsFolder = Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot", "uploads", "documents"
        );

        if (Directory.Exists(uploadsFolder))
        {
            var totalBytes = new DirectoryInfo(uploadsFolder)
                .GetFiles()
                .Sum(f => f.Length);

            storageUsedMB = Math.Round(totalBytes / (1024.0 * 1024.0), 2);
        }



        // ---- Questions asked & popular legal topics (FR-21) ----

        var totalQuestionsAsked =
            await _context.ChatMessages.CountAsync();


        var popularTopics = await _context.ChatMessages
            .Where(m => m.Category != null && m.Category != "")
            .GroupBy(m => m.Category)
            .Select(g => new PopularTopicDto
            {
                Category = g.Key,
                Count = g.Count()
            })
            .OrderByDescending(t => t.Count)
            .Take(5)
            .ToListAsync();



        return new DashboardStatsDto
        {

            TotalUsers = totalUsers,

            TotalDocuments = totalDocuments,

            TotalCategories = totalCategories,


            TotalChatSessions = totalQuestionsAsked,
            ChatSessionsTracked = true,


            StorageUsedMB = storageUsedMB,

            CategoryBreakdown = categoryBreakdown,

            RecentDocuments = recentDocuments,

            RegistrationTrend = registrationTrend,

            PopularTopics = popularTopics,

            TopViewedTracked = false

        };

    }

}
