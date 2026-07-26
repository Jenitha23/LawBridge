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

    // Relative path to the original uploaded PDF (e.g.
    // "/uploads/documents/xyz.pdf") — combine with the API's static-file
    // base URL to build a link the user can open/download.
    public string Source { get; set; } = string.Empty;

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

    // True when this result was found by meaning (pgvector semantic
    // search) rather than an exact substring match — lets the UI show
    // how a less-obvious result was found.
    public bool IsSemanticMatch { get; set; }

}