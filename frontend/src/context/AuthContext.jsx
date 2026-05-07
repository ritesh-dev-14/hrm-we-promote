import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
<<<<<<< HEAD
  const [role, setRole] = useState(() => {
    return localStorage.getItem("role") || null;
  });

  // Save role to localStorage whenever it changes
  useEffect(() => {
    if (role) {
      localStorage.setItem("role", role);
    } else {
      localStorage.removeItem("role");
    }
  }, [role]);

  const logout = () => {
    console.log("Logging out...");
    setRole(null);
    localStorage.removeItem("role");
=======
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // load from localStorage on refresh
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(storedUser);
      setRole(storedUser.role);
      setToken(storedToken);
    }

    // Finish loading regardless of whether data exists
    setIsLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    setRole(userData.role);
    setToken(token);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setToken(null);

    localStorage.removeItem("user");
>>>>>>> f937cc1c7304440d40a84a85d2dc05f3d734fa05
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{ user, role, token, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
