import { useEffect, useState } from "react";
import api from "../api/axios";


// Profile pictures live in private Azure Blob Storage and are only served
// through an authenticated endpoint (api/users/profile-image/{fileName} or
// api/admin/profile/image/{fileName}) — there is no public URL for them.
// A plain <img src="..."> can't attach the JWT the endpoint requires, so we
// fetch it ourselves through the appropriate axios instance (which does
// attach the token) and hand the <img> a local object URL instead.
//
// fileName: the blob filename stored on the user (e.g. user.profileImage)
// endpoint: the API path (relative to the "/api" base) that serves it,
//           e.g. "/users/profile-image" or "/admin/profile/image"
// client:   the axios instance to use — defaults to the regular user
//           instance (reads "token"). Admin screens must pass adminApi
//           (reads "adminToken") since it's a separate auth session and
//           the admin endpoint requires the Admin-role JWT specifically.

export function useProfileImageUrl(fileName, endpoint, client = api)
{
    const [url, setUrl] = useState(null);

    useEffect(() =>
    {
        if (!fileName)
        {
            setUrl(null);
            return;
        }

        let objectUrl = null;
        let cancelled = false;

        client.get(`${endpoint}/${fileName}`, { responseType: "blob" })
            .then((res) =>
            {
                if (cancelled) return;

                objectUrl = URL.createObjectURL(res.data);
                setUrl(objectUrl);
            })
            .catch(() =>
            {
                if (!cancelled) setUrl(null);
            });

        return () =>
        {
            cancelled = true;

            if (objectUrl)
            {
                URL.revokeObjectURL(objectUrl);
            }
        };

    }, [fileName, endpoint, client]);

    return url;
}