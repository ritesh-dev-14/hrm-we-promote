/**
 * Configuration for the application
 * This file centralizes all configuration values
 */

export const config = {
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  appName: import.meta.env.VITE_APP_NAME || "We Promote",
  appVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",
  tokenKey: "authToken",
  userKey: "authUser",
  roleKey: "userRole",
  dev: import.meta.env.DEV,
};

export default config;
