using System.Text;
using System.Text.Json;
using Pgvector;


namespace LawBridge.Backend.Services;


public class EmbeddingService
{

    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;


    public EmbeddingService(
        IConfiguration configuration,
        HttpClient httpClient
    )
    {
        _configuration = configuration;
        _httpClient = httpClient;
    }



    public async Task<Vector> GenerateEmbedding(
        string text
    )
    {

        // e.g. "http://localhost:11434"
        var baseUrl =
            _configuration["Ollama:BaseUrl"]
            ?? "http://localhost:11434";



        var model =
            _configuration["Ollama:EmbeddingModel"]
            ?? "nomic-embed-text";



        var requestBody = new
        {
            model = model,
            prompt = text
        };



        var content = new StringContent(
            JsonSerializer.Serialize(requestBody),
            Encoding.UTF8,
            "application/json"
        );



        var response =
            await _httpClient.PostAsync(
                $"{baseUrl}/api/embeddings",
                content
            );



        response.EnsureSuccessStatusCode();



        var responseJson =
            await response.Content.ReadAsStringAsync();



        using var doc =
            JsonDocument.Parse(responseJson);



        var embeddingArray =
            doc.RootElement.GetProperty("embedding");



        var values = new float[embeddingArray.GetArrayLength()];



        for(int i = 0; i < values.Length; i++)
        {
            values[i] = embeddingArray[i].GetSingle();
        }



        return new Vector(values);

    }

}