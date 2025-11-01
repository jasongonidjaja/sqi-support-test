export const setAuthData = (token, role) => {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
};

export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
};

export const getRole = () => {
  return localStorage.getItem("role");
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};
