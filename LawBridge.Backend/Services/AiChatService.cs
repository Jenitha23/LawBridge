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
            _configuration["OpenAI:ApiKey"]
            ?? throw new InvalidOperationException("OpenAI:ApiKey is not configured.");


        var model =
            _configuration["OpenAI:ChatModel"]
            ?? "gpt-4o-mini";


        var requestBody = new
        {
            model = model,
            messages = new[]
            {
                new { role = "user", content = prompt }
            },
            // Forces a valid JSON object back — every prompt that calls
            // this service already instructs the model to respond with
            // a single JSON object, so this is a safety net, not a
            // behavior change.
            response_format = new { type = "json_object" }
        };


        var request = new HttpRequestMessage(
            HttpMethod.Post,
            "https://api.openai.com/v1/chat/completions"
        )
        {
            Content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json"
            )
        };

        request.Headers.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);


        var response =
            await _httpClient.SendAsync(request);


        if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
        {
            // Give OpenAI a moment and retry once, with a brand-new request —
            // HttpRequestMessage instances can't be sent twice.
            await Task.Delay(3000);

            var retryRequest = new HttpRequestMessage(
                HttpMethod.Post,
                "https://api.openai.com/v1/chat/completions"
            )
            {
                Content = new StringContent(
                    JsonSerializer.Serialize(requestBody),
                    Encoding.UTF8,
                    "application/json"
                )
            };

            retryRequest.Headers.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

            response = await _httpClient.SendAsync(retryRequest);
        }


        if (!response.IsSuccessStatusCode)
        {

            var errorBody =
                await response.Content.ReadAsStringAsync();

            throw new HttpRequestException(
                $"OpenAI chat completion request failed ({(int)response.StatusCode} {response.StatusCode}): {errorBody}"
            );

        }


        var responseJson =
            await response.Content.ReadAsStringAsync();


        using var doc =
            JsonDocument.Parse(responseJson);


        return doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? string.Empty;

    }

}
