import Sidebar from "./components/Navbar.jsx";
import { AppRoutes } from "./routes/AppRoutes";
import { useLocation } from "react-router-dom";

export default function App() {
  const location = useLocation();

  const hideSidebar = location.pathname === "/login";

  return (
    <div className="flex h-screen w-full bg-[#FDFDFD] overflow-hidden">
      {!hideSidebar && <Sidebar />}

      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="max-w-350 p-0 mx-auto">
          <AppRoutes />
        </div>
      </div>
    </div>
  );
}
