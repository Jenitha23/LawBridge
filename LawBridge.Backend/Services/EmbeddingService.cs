using OpenAI.Embeddings;
using Pgvector;


namespace LawBridge.Backend.Services;


public class EmbeddingService
{

    private readonly IConfiguration _configuration;


    public EmbeddingService(
        IConfiguration configuration
    )
    {
        _configuration = configuration;
    }



    public async Task<Vector> GenerateEmbedding(
        string text
    )
    {

        var apiKey =
            _configuration["OpenAI:ApiKey"];



        var model =
            _configuration["OpenAI:EmbeddingModel"];



        var client =
            new EmbeddingClient(
                model,
                apiKey
            );



        var result =
            await client.GenerateEmbeddingAsync(
                text
            );



        var values =
    result.Value.ToFloats().ToArray();


return new Vector(values);

    }

}