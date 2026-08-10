import api from "../api/axios";


// Document files (both a user's own uploads and admin legal-document
// sources) live in private Azure Blob Storage and are now only servable
// through the authenticated endpoint api/documents/file/{fileName} — see
// backend Controllers/DocumentController.cs. There is no public URL for
// them, so a plain <a href="..."> can't open one (even a correctly-built
// URL would 401, since the browser can't attach the JWT to a navigation).
//
// This fetches the file through the appropriate axios instance (which
// does attach the token), then opens it as a local blob URL in a new tab.
//
// fileName: the blob filename (e.g. document.filePath / legalDoc.source)
// client:   the axios instance to use — defaults to the regular user
//           instance (reads "token"). Admin screens must pass adminApi
//           (reads "adminToken"), same as useProfileImageUrl.

export async function openDocumentFile(fileName, client = api)
{
    if (!fileName)
    {
        return;
    }

    const response = await client.get(
        `/documents/file/${fileName}`,
        { responseType: "blob" }
    );

    const objectUrl = URL.createObjectURL(response.data);

    window.open(objectUrl, "_blank", "noopener,noreferrer");

    // Give the new tab time to actually load the blob before revoking it.
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
}