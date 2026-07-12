// The backend serves uploaded files (e.g. profile-images/xxx.png) as static
// files from wwwroot, at the API host root (NOT under /api).
// api/axios.js points at http://localhost:5176/api, so we strip "/api" off
// to get the host root the static files live on.

import api from "../api/axios";

const API_ROOT = api.defaults.baseURL.replace(/\/api\/?$/, "");

/**
 * Turns a relative path returned by the backend (e.g. "profile-images/abc.png")
 * into a full URL the <img> tag can load. Returns null if no path is given.
 */
export function getAssetUrl(path)
{
    if (!path)
    {
        return null;
    }

    if (path.startsWith("http://") || path.startsWith("https://"))
    {
        return path;
    }

    return `${API_ROOT}/${path}`;
}
