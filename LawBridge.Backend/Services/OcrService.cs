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

        // `language` here is the language the person wants their AI
        // EXPLANATION in — not necessarily the script the document itself
        // is written in (an English notice can still be explained in
        // Sinhala). Using it to pick the OCR trained-data pack was wrong:
        // it made Tesseract try to read English text with Sinhala/Tamil
        // recognition (or vice versa) whenever they didn't match, producing
        // garbled extracted text. OCR must read whatever script is actually
        // on the page, so it always runs with all bundled scripts combined
        // — Tesseract picks the best match per line regardless of which
        // language the explanation will be translated into afterward.

        return await Task.Run(() =>
        {

            using var engine =
                new TesseractEngine(_tessDataPath, "eng+sin+tam", EngineMode.Default);

            using var img =
                Pix.LoadFromFile(imagePath);

            using var page =
                engine.Process(img);

            return page.GetText()?.Trim() ?? string.Empty;

        });

    }


}