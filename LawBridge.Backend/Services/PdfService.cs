using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;


namespace LawBridge.Backend.Services;


public class PdfService
{

    public async Task<string> ExtractTextAsync(string filePath)
    {

        return await Task.Run(() =>
        {

            string text = "";


            using(
                PdfReader reader =
                new PdfReader(filePath)
            )
            {

                using(
                    PdfDocument pdf =
                    new PdfDocument(reader)
                )
                {

                    for(int i = 1; i <= pdf.GetNumberOfPages(); i++)
                    {

                        text +=
                        PdfTextExtractor.GetTextFromPage(
                            pdf.GetPage(i)
                        );


                        text += "\n";

                    }

                }

            }


            return text;

        });

    }

}