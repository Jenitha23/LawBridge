using Azure.Identity;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace LawBridge.Backend.Services;

public class BlobStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly string _documentsContainer;
    private readonly string _profileImagesContainer;

    public BlobStorageService(IConfiguration configuration)
    {
        var blobServiceUri =
            configuration["AzureStorage:BlobServiceUri"]
            ?? throw new InvalidOperationException(
                "AzureStorage:BlobServiceUri is not configured.");

        _documentsContainer =
            configuration["AzureStorage:DocumentsContainer"]
            ?? "lawbridge-documents";

        _profileImagesContainer =
            configuration["AzureStorage:ProfileImagesContainer"]
            ?? "lawbridge-profile-images";

        _blobServiceClient =
            new BlobServiceClient(
                new Uri(blobServiceUri),
                new DefaultAzureCredential()
            );
    }

    // ============================================================
    // Upload Document
    // ============================================================

    public async Task<string> UploadDocumentAsync(
        Stream stream,
        string fileName,
        string contentType)
    {
        var containerClient =
            _blobServiceClient.GetBlobContainerClient(
                _documentsContainer);

        await containerClient.CreateIfNotExistsAsync();

        var blobClient =
            containerClient.GetBlobClient(fileName);

        await blobClient.UploadAsync(
            stream,
            new BlobUploadOptions
            {
                HttpHeaders = new BlobHttpHeaders
                {
                    ContentType = contentType
                }
            });

        return fileName;
    }

    // ============================================================
    // Upload Profile Image
    // ============================================================

    public async Task<string> UploadProfileImageAsync(
        Stream stream,
        string fileName,
        string contentType)
    {
        var containerClient =
            _blobServiceClient.GetBlobContainerClient(
                _profileImagesContainer);

        await containerClient.CreateIfNotExistsAsync();

        var blobClient =
            containerClient.GetBlobClient(fileName);

        await blobClient.UploadAsync(
            stream,
            new BlobUploadOptions
            {
                HttpHeaders = new BlobHttpHeaders
                {
                    ContentType = contentType
                }
            });

        return fileName;
    }

    // ============================================================
    // Download Document
    // ============================================================

    public async Task<Stream> DownloadDocumentAsync(
        string fileName)
    {
        var containerClient =
            _blobServiceClient.GetBlobContainerClient(
                _documentsContainer);

        var blobClient =
            containerClient.GetBlobClient(fileName);

        var response =
            await blobClient.DownloadStreamingAsync();

        return response.Value.Content;
    }

    // ============================================================
    // Delete Document
    // ============================================================

    public async Task DeleteDocumentAsync(
        string fileName)
    {
        var containerClient =
            _blobServiceClient.GetBlobContainerClient(
                _documentsContainer);

        var blobClient =
            containerClient.GetBlobClient(fileName);

        await blobClient.DeleteIfExistsAsync();
    }
}