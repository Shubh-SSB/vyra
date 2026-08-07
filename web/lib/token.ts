const ACCESS_TOKEN = 'accessToken';
const REFRESH_TOKEN = 'refreshToken';

export const getAccessToken = () =>
    localStorage.getItem(ACCESS_TOKEN);

export const getRefreshToken = () =>
    localStorage.getItem(REFRESH_TOKEN);

export const setTokens = (
    accessToken: string,
    refreshToken: string
) => {
    localStorage.setItem(ACCESS_TOKEN, accessToken);
    localStorage.setItem(REFRESH_TOKEN, refreshToken);
}

export const clearTokens = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
}

export const getMyUserId = (): string | null => {
    try {
        if (typeof window === "undefined") return null;
        const token = getAccessToken();
        if (!token) return null;
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.sub ?? payload.id ?? payload.userId ?? null;
    } catch {
        return null;
    }
};