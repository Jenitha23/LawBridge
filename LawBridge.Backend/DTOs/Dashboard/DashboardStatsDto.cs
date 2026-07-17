namespace LawBridge.Backend.DTOs.Dashboard;


public class DashboardStatsDto
{

    public int TotalUsers { get; set; }


    public int TotalDocuments { get; set; }


    public int TotalCategories { get; set; }


    // AI chat will implement later - no ChatSession tracking exists yet
    public int TotalChatSessions { get; set; }
    public bool ChatSessionsTracked { get; set; } = false;


    public double StorageUsedMB { get; set; }


    public List<CategoryBreakdownDto> CategoryBreakdown { get; set; }
        = new();


    public List<RecentDocumentDto> RecentDocuments { get; set; }
        = new();


    public List<RegistrationPointDto> RegistrationTrend { get; set; }
        = new();


    // Document view counts aren't tracked anywhere in the schema yet
    public bool TopViewedTracked { get; set; } = false;

}


public class CategoryBreakdownDto
{
    public string Name { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percent { get; set; }
}


public class RecentDocumentDto
{
    public string Title { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}


public class RegistrationPointDto
{
    public DateTime Date { get; set; }
    public int Count { get; set; }
}
