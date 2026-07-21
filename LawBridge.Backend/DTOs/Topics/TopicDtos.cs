namespace LawBridge.Backend.DTOs.Topics;


public class TopicCategoryDto
{

    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int DocumentCount { get; set; }

}


public class TopicListItemDto
{

    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Language { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

}


public class TopicDetailDto
{

    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string CategoryName { get; set; } = string.Empty;

    public string Language { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

}


public class TopicSearchResultDto
{

    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string CategoryName { get; set; } = string.Empty;

    public string Language { get; set; } = string.Empty;

    // Short excerpt around the matched text
    public string Snippet { get; set; } = string.Empty;

}
