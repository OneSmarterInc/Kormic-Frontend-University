const KEYS = {
  access: "kormic.access_token",
  refresh: "kormic.refresh_token",
  user: "kormic.user",
};

export const getAccessToken = () => localStorage.getItem(KEYS.access) || "";
export const setAccessToken = (token) => localStorage.setItem(KEYS.access, token);

export const getRefreshToken = () => localStorage.getItem(KEYS.refresh) || "";
export const setRefreshToken = (token) => localStorage.setItem(KEYS.refresh, token);

export const getCachedUser = () => {
  try {
    const raw = localStorage.getItem(KEYS.user);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
export const setCachedUser = (user) => localStorage.setItem(KEYS.user, JSON.stringify(user));

export const clearAuth = () => {
  localStorage.removeItem(KEYS.access);
  localStorage.removeItem(KEYS.refresh);
  localStorage.removeItem(KEYS.user);
};
