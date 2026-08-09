import { useEffect, useState } from "react";
import api from "../api/axios";


// Profile pictures live in private Azure Blob Storage and are only served
// through an authenticated endpoint (api/users/profile-image/{fileName} or
// api/admin/profile/image/{fileName}) — there is no public URL for them.
// A plain <img src="..."> can't attach the JWT the endpoint requires, so we
// fetch it ourselves through the shared axios instance (which does attach
// the token) and hand the <img> a local object URL instead.
//
// fileName: the blob filename stored on the user (e.g. user.profileImage)
// endpoint: the API path (relative to the "/api" base) that serves it,
//           e.g. "/users/profile-image" or "/admin/profile/image"

export function useProfileImageUrl(fileName, endpoint)
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

        api.get(`${endpoint}/${fileName}`, { responseType: "blob" })
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

    }, [fileName, endpoint]);

    return url;
}