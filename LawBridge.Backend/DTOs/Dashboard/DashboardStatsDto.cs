namespace LawBridge.Backend.DTOs.Dashboard;


public class DashboardStatsDto
{

    public int TotalUsers { get; set; }


    public int TotalDocuments { get; set; }


    public int TotalCategories { get; set; }


    // Each ChatMessage is one question — there's no session grouping in
    // this app, so this is really "questions asked", not distinct sessions.
    public int TotalChatSessions { get; set; }
    public bool ChatSessionsTracked { get; set; } = false;


    public double StorageUsedMB { get; set; }


    public List<CategoryBreakdownDto> CategoryBreakdown { get; set; }
        = new();


    public List<RecentDocumentDto> RecentDocuments { get; set; }
        = new();


    public List<RegistrationPointDto> RegistrationTrend { get; set; }
        = new();


    public List<PopularTopicDto> PopularTopics { get; set; }
        = new();


    public List<TopViewedDocumentDto> TopViewedDocuments { get; set; }
        = new();


    public bool TopViewedTracked { get; set; } = false;

}


public class TopViewedDocumentDto
{
    public string Title { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public int ViewCount { get; set; }
}


public class PopularTopicDto
{
    public string Category { get; set; } = string.Empty;
    public int Count { get; set; }
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
