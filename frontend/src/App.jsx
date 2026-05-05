// import Navbar from "./components/Navbar.jsx";
// import { AuthProvider } from "./context/AuthContext.jsx";
// import { AppRoutes } from "./routes/AppRoutes";

// export default function App() {
//   return (
//     <div className="min-h-screen bg-slate-50">
//       <AuthProvider>

//       <Navbar />
//       <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
//         <AppRoutes />
//       </main>
//       </AuthProvider>
//     </div>
//   );
// }


import Sidebar from "./components/Navbar.jsx"; 
import { AuthProvider } from "./context/AuthContext.jsx";
import { AppRoutes } from "./routes/AppRoutes";

export default function App() {
  return (
    <AuthProvider>
      <div className="flex h-screen w-full bg-[#FDFDFD] overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-10 custom-scrollbar">
          <div className="max-w-350 mx-auto">
            <AppRoutes />
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
