using System.Text;
using System.Text.Json;

namespace LawBridge.Backend.Services;


public class OllamaChatService
{

    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;


    public OllamaChatService(
        IConfiguration configuration,
        HttpClient httpClient
    )
    {
        _configuration = configuration;
        _httpClient = httpClient;

        // Local model generation can take a while on CPU — give it room.
        _httpClient.Timeout = TimeSpan.FromMinutes(3);
    }



    public async Task<string> Generate(string prompt)
    {

        var baseUrl =
            _configuration["Ollama:BaseUrl"]
            ?? "http://localhost:11434";


        var model =
            _configuration["Ollama:ChatModel"]
            ?? "llama3.2:3b";


        var requestBody = new
        {
            model = model,
            prompt = prompt,
            stream = false,
            format = "json"
        };


        var content = new StringContent(
            JsonSerializer.Serialize(requestBody),
            Encoding.UTF8,
            "application/json"
        );


        var response =
            await _httpClient.PostAsync(
                $"{baseUrl}/api/generate",
                content
            );


        response.EnsureSuccessStatusCode();


        var responseJson =
            await response.Content.ReadAsStringAsync();


        using var doc =
            JsonDocument.Parse(responseJson);


        return doc.RootElement
            .GetProperty("response")
            .GetString() ?? string.Empty;

    }

}
