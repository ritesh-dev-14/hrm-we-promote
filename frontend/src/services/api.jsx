import axios from "axios";

<<<<<<< HEAD
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
=======
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
>>>>>>> f937cc1c7304440d40a84a85d2dc05f3d734fa05
const API = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
    console.log("✅ Token added to request:", token.substring(0, 20) + "...");
  } else {
    console.warn("⚠️ No token found in localStorage");
  }
  return config;
}, (error) => {
  console.error("❌ Request interceptor error:", error);
  return Promise.reject(error);
});

// Add response interceptor for debugging
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("❌ 401 Unauthorized - Token might be invalid");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    }
    return Promise.reject(error);
  }
);

export default API;