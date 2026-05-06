// import { useState } from "react";
// import { Eye, EyeOff, ArrowLeft, Lock, Mail } from "lucide-react";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate, Link } from "react-router-dom";

// export default function Login() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const { setRole } = useAuth();
//   const navigate = useNavigate();

//   const handleLogin = (e) => {
//     e.preventDefault();

//     // Role logic based on your system roles: EMPLOYEE, MANAGER, HR, ADMIN
//     if (email.includes("admin")) setRole("ADMIN");
//     else if (email.includes("hr")) setRole("HR");
//     else if (email.includes("manager")) setRole("MANAGER");
//     else setRole("EMPLOYEE");

//     navigate("/dashboard");
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
//       {/* Back Button */}

//       <div className="w-full max-w-[440px] bg-white p-10 rounded-[32px] shadow-xl shadow-indigo-500/5 border border-[#F1F5F9]">
        
//         {/* Header */}
//         <div className="text-center mb-10">
//           <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#6366F1] mx-auto mb-4 shadow-inner">
//             <Lock size={28} />
//           </div>
//           <h1 className="text-[32px] font-bold text-[#0F172A] tracking-tight">
//             Welcome back
//           </h1>
//           <p className="text-[#64748B] font-medium mt-2">
//             Enter your credentials to access the portal
//           </p>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleLogin} className="space-y-5">

//           {/* Email */}
//           <div className="space-y-2">
//             <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
//               Email address
//             </label>
//             <div className="relative group">
//               <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6366F1] transition-colors" size={18} />
//               <input
//                 type="email"
//                 placeholder="name@company.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 className="w-full h-14 pl-12 pr-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] outline-none focus:border-[#6366F1] focus:ring-4 focus:ring-indigo-500/5 transition-all font-medium text-[#1E293B]"
//               />
//             </div>
//           </div>

//           {/* Password */}
//           <div className="space-y-2">
//             <div className="flex justify-between items-center px-1">
//               <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">
//                 Password
//               </label>
//               <button type="button" className="text-[11px] font-bold text-[#6366F1] hover:underline">
//                 Forgot password?
//               </button>
//             </div>

//             <div className="relative group">
//               <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6366F1] transition-colors" size={18} />
//               <input
//                 type={showPassword ? "text" : "password"}
//                 placeholder="••••••••"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 className="w-full h-14 pl-12 pr-12 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] outline-none focus:border-[#6366F1] focus:ring-4 focus:ring-indigo-500/5 transition-all font-medium text-[#1E293B]"
//               />

//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
//               >
//                 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//               </button>
//             </div>
//           </div>

//           {/* Remember Me */}
//           <div className="flex items-center gap-2 px-1">
//             <input 
//               type="checkbox" 
//               id="remember" 
//               className="w-4 h-4 rounded border-slate-300 text-[#6366F1] focus:ring-[#6366F1]" 
//             />
//             <label htmlFor="remember" className="text-sm font-medium text-slate-600 cursor-pointer">
//               Remember me
//             </label>
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             className="w-full h-14 mt-4 rounded-2xl text-white font-bold bg-[#6366F1] shadow-lg shadow-indigo-200 hover:bg-[#4F46E5] hover:shadow-indigo-300 transition-all active:scale-[0.98]"
//           >
//             Sign in to Portal
//           </button>
//         </form>

//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../services/api"; // ✅ axios instance

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { setRole } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/api/auth/login", {
        email,
        password,
      });

      // ✅ backend response
      const { user, token } = res.data.data;

      // store token
      localStorage.setItem("token", token);

      // set role from backend
      setRole(user.role);

      // redirect
      navigate("/dashboard");

    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Login failed";
      console.error("Login error:", errorMsg);
      setError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-[440px] bg-white p-10 rounded-[32px] shadow-xl border border-[#F1F5F9]">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#6366F1] mx-auto mb-4">
            <Lock size={28} />
          </div>
          <h1 className="text-[32px] font-bold text-[#0F172A]">
            Welcome back
          </h1>
          <p className="text-[#64748B] mt-2">
            Enter your credentials
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">

          {/* Email */}
          <div>
            <label className="text-xs font-bold text-slate-500">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-indigo-500/10 transition-all"
                placeholder="Enter email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-bold text-slate-500">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 pl-10 pr-10 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-indigo-500/10 transition-all"
                placeholder="Enter password"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full h-12 mt-4 bg-[#6366F1] text-white rounded-xl font-bold hover:bg-[#4F46E5] transition-all"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}