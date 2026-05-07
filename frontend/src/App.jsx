import Sidebar from "./components/Navbar.jsx";
import { AppRoutes } from "./routes/AppRoutes";
import { useLocation } from "react-router-dom";

export default function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  // On login page, render only the content without sidebar
  if (isLoginPage) {
    return <AppRoutes />;
  }

  return (
<<<<<<< HEAD
    <div className="flex h-screen w-full bg-[#FDFDFD] overflow-hidden">
      <Sidebar />
=======
    // <AuthProvider>
      <div className="flex h-screen w-full bg-[#FDFDFD] overflow-hidden">
        
        {!hideSidebar && <Sidebar />}

        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="max-w-350 p-0 mx-auto">
            <AppRoutes />
          </div>
        </div>
>>>>>>> f937cc1c7304440d40a84a85d2dc05f3d734fa05

      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <AppRoutes />
      </div>
<<<<<<< HEAD
    </div>
=======
    // </AuthProvider>
>>>>>>> f937cc1c7304440d40a84a85d2dc05f3d734fa05
  );
}