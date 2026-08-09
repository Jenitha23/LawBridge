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
    // Used when processing documents temporarily
    // ============================================================

    public async Task<Stream> DownloadDocumentAsync(
        string fileName)
    {
        var containerClient =
            _blobServiceClient.GetBlobContainerClient(
                _documentsContainer);

        var blobClient =
            containerClient.GetBlobClient(fileName);

        if (!await blobClient.ExistsAsync())
        {
            throw new FileNotFoundException(
                "Document not found.",
                fileName);
        }

        var response =
            await blobClient.DownloadStreamingAsync();

        return response.Value.Content;
    }

    // ============================================================
    // Download Profile Image
    // Used by UserController and AdminProfileController
    // ============================================================

    public async Task<(
        Stream Stream,
        string ContentType
    )> DownloadProfileImageAsync(
        string fileName)
    {
        var containerClient =
            _blobServiceClient.GetBlobContainerClient(
                _profileImagesContainer);

        var blobClient =
            containerClient.GetBlobClient(fileName);

        if (!await blobClient.ExistsAsync())
        {
            throw new FileNotFoundException(
                "Profile image not found.",
                fileName);
        }

        var response =
            await blobClient.DownloadStreamingAsync();

        var contentType =
            response.Value.Details.ContentType;

        if (string.IsNullOrWhiteSpace(contentType))
        {
            contentType = GetContentTypeFromExtension(
                fileName);
        }

        return (
            response.Value.Content,
            contentType
        );
    }

    // ============================================================
    // Delete Document
    // ============================================================

    public async Task DeleteDocumentAsync(
        string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
        {
            return;
        }

        var containerClient =
            _blobServiceClient.GetBlobContainerClient(
                _documentsContainer);

        var blobClient =
            containerClient.GetBlobClient(fileName);

        await blobClient.DeleteIfExistsAsync();
    }

    // ============================================================
    // Delete Profile Image
    // ============================================================

    public async Task DeleteProfileImageAsync(
        string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
        {
            return;
        }

        var containerClient =
            _blobServiceClient.GetBlobContainerClient(
                _profileImagesContainer);

        var blobClient =
            containerClient.GetBlobClient(fileName);

        await blobClient.DeleteIfExistsAsync();
    }

    // ============================================================
    // Content Type Helper
    // ============================================================

    private static string GetContentTypeFromExtension(
        string fileName)
    {
        var extension =
            Path.GetExtension(fileName)
                .ToLowerInvariant();

        return extension switch
        {
            ".jpg" => "image/jpeg",
            ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".webp" => "image/webp",
            ".pdf" => "application/pdf",
            _ => "application/octet-stream"
        };
    }
}