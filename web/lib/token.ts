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