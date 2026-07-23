using Microsoft.EntityFrameworkCore;
using Pgvector;
using Pgvector.EntityFrameworkCore;
using LawBridge.Backend.Data;

namespace LawBridge.Backend.Services;


public class LegalSearchResult
{

    public int DocumentId { get; set; }

    public string Text { get; set; } = string.Empty;

    public double Distance { get; set; }

}


public class LegalSearchService
{

    private readonly RagDbContext _ragContext;


    public LegalSearchService(RagDbContext ragContext)
    {
        _ragContext = ragContext;
    }



    public async Task<List<LegalSearchResult>> Search(
        Vector queryEmbedding,
        int topK = 5,
        List<int>? allowedDocumentIds = null
    )
    {

        var query = _ragContext.LegalChunks
            .Where(c => c.Embedding != null);


        if (allowedDocumentIds != null && allowedDocumentIds.Count > 0)
        {
            query = query.Where(c => allowedDocumentIds.Contains(c.DocumentId));
        }


        return await query
            .OrderBy(c => c.Embedding!.CosineDistance(queryEmbedding))
            .Take(topK)
            .Select(c => new LegalSearchResult
            {
                DocumentId = c.DocumentId,
                Text = c.Text,
                Distance = c.Embedding!.CosineDistance(queryEmbedding)
            })
            .ToListAsync();

    }

}
