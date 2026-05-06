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
    <div className="flex h-screen w-full bg-[#FDFDFD] overflow-hidden">
      <Sidebar />

      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <AppRoutes />
      </div>
    </div>
  );
}