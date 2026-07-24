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
            _configuration["Gemini:ApiKey"]
            ?? throw new InvalidOperationException("Gemini:ApiKey is not configured.");


        var model =
            _configuration["Gemini:EmbeddingModel"]
            ?? "gemini-embedding-001";


        // Kept at 1536 to match the existing "vector(1536)" column in the
        // RAG database — gemini-embedding-001 supports truncated output via
        // Matryoshka Representation Learning, so this avoids a schema
        // migration when swapping providers.
        var dimensions =
            _configuration.GetValue<int?>("Gemini:EmbeddingDimensions")
            ?? 1536;


        var requestBody = new
        {
            content = new
            {
                parts = new[]
                {
                    new { text = text }
                }
            },
            outputDimensionality = dimensions
        };


        var url =
            $"https://generativelanguage.googleapis.com/v1beta/models/{model}:embedContent";


        HttpRequestMessage BuildRequest()
        {
            var req = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = new StringContent(
                    JsonSerializer.Serialize(requestBody),
                    Encoding.UTF8,
                    "application/json"
                )
            };

            req.Headers.Add("x-goog-api-key", apiKey);

            return req;
        }



        var response =
            await _httpClient.SendAsync(BuildRequest());


        // Retry on rate-limiting (429) and transient overload (503) —
        // Gemini returns 503 "UNAVAILABLE" when the model is under heavy
        // demand, which is usually resolved within a few seconds. If this
        // is actually a quota/billing issue, the retries fail the same way
        // and we fall through to the detailed error below.
        var attempt = 0;
        var maxAttempts = 3;
        var delayMs = 2000;

        while (
            attempt < maxAttempts
            && (
                response.StatusCode == System.Net.HttpStatusCode.TooManyRequests
                || response.StatusCode == System.Net.HttpStatusCode.ServiceUnavailable
            )
        )
        {
            // HttpRequestMessage instances can't be sent twice, so a fresh
            // one is built for every retry attempt.
            await Task.Delay(delayMs);

            response = await _httpClient.SendAsync(BuildRequest());

            attempt++;
            delayMs *= 2;
        }


        if (!response.IsSuccessStatusCode)
        {

            var errorBody =
                await response.Content.ReadAsStringAsync();

            throw new HttpRequestException(
                $"Gemini embeddings request failed ({(int)response.StatusCode} {response.StatusCode}): {errorBody}"
            );

        }



        var responseJson =
            await response.Content.ReadAsStringAsync();



        using var doc =
            JsonDocument.Parse(responseJson);



        var embeddingArray = doc.RootElement
            .GetProperty("embedding")
            .GetProperty("values");



        var values = new float[embeddingArray.GetArrayLength()];



        for(int i = 0; i < values.Length; i++)
        {
            values[i] = embeddingArray[i].GetSingle();
        }



        return new Vector(values);

    }

}
