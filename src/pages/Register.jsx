import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { register } from "../apiEndPoints/auth";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handelRegister = async (e) => {
    e.preventDefault();

    if (!email || !password || !name) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await register({ email, password, name });
      const { user } = response.data.data;

      if (response.data.success) {
        toast.success(`Welcome, ${user.name} `);
        setTimeout(() => {
          navigate("/login");
        }, 100);
      } else {
        toast.error("Register failed");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-[#6C63FF] via-[#9C88FF] to-[#FF6B9D] bg-animate">
      <div className="text-center mb-8 animate-fade-in-down">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-md">Storyline</h2>
        <p className="text-white/90 text-lg">Create Your Account</p>
      </div>
      
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl transform transition-all duration-500 hover:shadow-2xl animate-fade-in-up">
        <div className="space-y-1 mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Get Started</h2>
          <p className="text-gray-500 text-sm">Create your account to continue</p>
        </div>

        <form onSubmit={handelRegister} className="space-y-6">
          <div className="space-y-1">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div className="relative mt-1">
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-transparent transition-all duration-200 outline-none"
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative mt-1">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-transparent transition-all duration-200 outline-none"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="text-xs text-gray-500">
                At least 8 characters
              </div>
            </div>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-transparent transition-all duration-200 pr-12 outline-none"
                placeholder="••••••••"
                minLength="8"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full theme-bg-btn text-white font-semibold py-3 px-4 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:animate-pulse-glow"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Already have an account?</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => navigate("/login")}
              className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6C63FF]/50 transition-all duration-200"
            >
              Sign in to your account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
