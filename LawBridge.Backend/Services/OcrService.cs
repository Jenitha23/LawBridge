using Tesseract;

namespace LawBridge.Backend.Services;


public class OcrService
{

    private readonly string _tessDataPath;


    public OcrService(IWebHostEnvironment env)
    {

        // tessdata/ ships at the project root alongside Program.cs —
        // ContentRootPath points there whether running via `dotnet run`
        // or a published build, as long as the folder is deployed with it.
        _tessDataPath =
            Path.Combine(env.ContentRootPath, "tessdata");

    }



    public async Task<string> ExtractTextFromImage(string imagePath, string language = "English")
    {

        return await Task.Run(() =>
        {

            var tesseractLang = ToTesseractLanguageCode(language);

            using var engine =
                new TesseractEngine(_tessDataPath, tesseractLang, EngineMode.Default);

            using var img =
                Pix.LoadFromFile(imagePath);

            using var page =
                engine.Process(img);

            return page.GetText()?.Trim() ?? string.Empty;

        });

    }



    private static string ToTesseractLanguageCode(string language)
    {

        // Falls back to English if a trained-data file for the requested
        // script isn't bundled — better a readable-but-wrong-language OCR
        // pass than a hard failure.
        return language.Trim().ToLowerInvariant() switch
        {
            "sinhala" => "sin",
            "tamil" => "tam",
            _ => "eng"
        };

    }

}
