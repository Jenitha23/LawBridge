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

        var apiKey =
            _configuration["OpenAI:ApiKey"]
            ?? throw new InvalidOperationException("OpenAI:ApiKey is not configured.");


        var model =
            _configuration["OpenAI:EmbeddingModel"]
            ?? "text-embedding-3-small";


        var requestBody = new
        {
            model = model,
            input = text
        };


        HttpRequestMessage BuildRequest() => new(
            HttpMethod.Post,
            "https://api.openai.com/v1/embeddings"
        )
        {
            Content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json"
            ),
            Headers =
            {
                Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey)
            }
        };



        var response =
            await _httpClient.SendAsync(BuildRequest());


        if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
        {
            // Give OpenAI a moment and retry once, with a brand-new request —
            // HttpRequestMessage instances can't be sent twice. Covers a
            // genuine transient rate-limit blip; if this is actually a
            // quota/billing issue, the retry fails the same way and we
            // fall through to the detailed error below.
            await Task.Delay(3000);

            response = await _httpClient.SendAsync(BuildRequest());
        }


        if (!response.IsSuccessStatusCode)
        {

            var errorBody =
                await response.Content.ReadAsStringAsync();

            throw new HttpRequestException(
                $"OpenAI embeddings request failed ({(int)response.StatusCode} {response.StatusCode}): {errorBody}"
            );

        }



        var responseJson =
            await response.Content.ReadAsStringAsync();



        using var doc =
            JsonDocument.Parse(responseJson);



        var embeddingArray = doc.RootElement
            .GetProperty("data")[0]
            .GetProperty("embedding");



        var values = new float[embeddingArray.GetArrayLength()];



        for(int i = 0; i < values.Length; i++)
        {
            values[i] = embeddingArray[i].GetSingle();
        }



        return new Vector(values);

    }

}