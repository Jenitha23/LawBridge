using System.Text;
using System.Text.Json;

namespace LawBridge.Backend.Services;


public class AiChatService
{

    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;


    public AiChatService(
        IConfiguration configuration,
        HttpClient httpClient
    )
    {
        _configuration = configuration;
        _httpClient = httpClient;

        _httpClient.Timeout = TimeSpan.FromMinutes(2);
    }



    public async Task<string> Generate(string prompt)
    {

        var apiKey =
            _configuration["Gemini:ApiKey"]
            ?? throw new InvalidOperationException("Gemini:ApiKey is not configured.");


        var model =
            _configuration["Gemini:ChatModel"]
            ?? "gemini-3.1-flash-lite";


        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    role = "user",
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            },
            // Forces a valid JSON object back — every prompt that calls
            // this service already instructs the model to respond with
            // a single JSON object, so this is a safety net, not a
            // behavior change.
            generationConfig = new
            {
                response_mime_type = "application/json"
            }
        };


        var url =
            $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent";


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
        // demand, which is usually resolved within a few seconds.
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
                $"Gemini chat completion request failed ({(int)response.StatusCode} {response.StatusCode}): {errorBody}"
            );

        }


        var responseJson =
            await response.Content.ReadAsStringAsync();


        using var doc =
            JsonDocument.Parse(responseJson);


        return doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString() ?? string.Empty;

    }

}
