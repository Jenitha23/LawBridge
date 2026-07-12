namespace LawBridge.Backend.Services;


public class ChunkService
{


    public List<string> CreateChunks(
        string text,
        int chunkSize = 1000
    )
    {

        var chunks = new List<string>();


        int start = 0;


        while(start < text.Length)
        {

            int length =
            Math.Min(
                chunkSize,
                text.Length - start
            );


            string chunk =
            text.Substring(
                start,
                length
            );


            // avoid cutting words
            if(start + length < text.Length)
            {

                int lastSpace =
                chunk.LastIndexOf(" ");


                if(lastSpace > 0)
                {
                    chunk =
                    chunk.Substring(
                        0,
                        lastSpace
                    );

                    length = lastSpace;
                }

            }


            chunks.Add(
                chunk.Trim()
            );


            // overlap for context
            start += length;

        }


        return chunks;

    }


}