import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on input change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ email: "", password: "", general: "" });

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...validationErrors }));
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const { user, token } = response?.data?.data;

      if (!user || !token) {
        throw new Error("Invalid server response");
      }

      login(user, token);
      // Navigate to dashboard (AppRoutes component handles role-based content)
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";

      if (message.toLowerCase().includes("password")) {
        setErrors((prev) => ({ ...prev, password: "Incorrect password" }));
      } else if (
        message.toLowerCase().includes("email") ||
        message.toLowerCase().includes("not found")
      ) {
        setErrors((prev) => ({ ...prev, email: "Email not found" }));
      } else {
        setErrors((prev) => ({ ...prev, general: message }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-slate-50 to-indigo-50 flex items-center justify-center p-4 sm:p-6">
      {/* Main Container */}
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl sm:rounded-4xl shadow-lg sm:shadow-2xl border border-slate-100 p-6 sm:p-8 lg:p-10">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <Lock className="text-indigo-600" size={28} strokeWidth={1.5} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              Welcome Back
            </h1>

            <p className="text-sm sm:text-base text-slate-500">
              Sign in to your account to continue
            </p>
          </div>

          {/* General Error Alert */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
              <p className="text-sm sm:text-base text-red-700 font-medium">
                {errors.general}
              </p>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5 sm:space-y-6"
            noValidate
          >
            {/* Email Field */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    errors.email ? "text-red-400" : "text-slate-400"
                  }`}
                  size={18}
                  strokeWidth={1.5}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className={`w-full px-4 sm:px-5 py-3 sm:py-3.5 pl-12 sm:pl-13 rounded-xl sm:rounded-2xl border-2 transition-all outline-none placeholder:text-slate-400 text-sm sm:text-base ${
                    errors.email
                      ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  }`}
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-xs sm:text-sm text-red-600 font-medium flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    errors.password ? "text-red-400" : "text-slate-400"
                  }`}
                  size={18}
                  strokeWidth={1.5}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={`w-full px-4 sm:px-5 py-3 sm:py-3.5 pl-12 sm:pl-13 pr-12 rounded-xl sm:rounded-2xl border-2 transition-all outline-none placeholder:text-slate-400 text-sm sm:text-base ${
                    errors.password
                      ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  }`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-xs sm:text-sm text-red-600 font-medium flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 py-3 sm:py-4 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-indigo-300 disabled:to-indigo-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl sm:rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-md text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center mt-6 sm:mt-8 text-xs sm:text-sm text-slate-500">
            Don't have an account?{" "}
            <span className="text-indigo-600 font-semibold">Contact HR</span>
          </p>
        </div>
      </div>
    </div>
  );
}
