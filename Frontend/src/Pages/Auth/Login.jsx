import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../../redux/apiSlice";
import { setCredentials } from "../../redux/slices/authSlice";
import toast from "react-hot-toast";
import { HiOutlineMail, HiOutlineLockClosed } from "react-icons/hi";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginUser, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Explicitly clear fields on mount or navigation
  useEffect(() => {
    setEmail("");
    setPassword("");
  }, [location.pathname]);

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      const res = await loginUser({ email, password }).unwrap();

      // Clear fields immediately on success
      setEmail("");
      setPassword("");

      // Dispatch to Redux store
      dispatch(
        setCredentials({
          data: res?.data,
          accessToken: res?.accessToken,
        })
      );

      toast.success(`Welcome back, ${res?.data?.userName || "User"}!`);

      // If Seller, redirect to Seller Dashboard, otherwise redirect to intended or home page
      if (res?.data?.role === "Seller") {
        navigate("/seller/dashboard");
      } else {
        navigate(from === "/login" ? "/" : from);
      }
    } catch (err) {
      const errorMsg =
        err?.data?.message || "Invalid credentials. Please verify your email or password.";
      toast.error(errorMsg);

      // If unverified email error, provide link to verify
      if (errorMsg.toLowerCase().includes("verify your email")) {
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        }, 1500);
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-[#121215] border border-neutral-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-widest font-mono text-neutral-500">
            NUVORA ACCESS
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-['Syne',sans-serif]">
            Welcome Back
          </h1>
          <p className="text-xs text-neutral-400">
            Sign in to access your curated bag and order history
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit} autoComplete="off">
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
                placeholder="name@example.com"
                className="w-full bg-neutral-900 text-sm text-white pl-10 pr-4 py-3 rounded-xl border border-neutral-800 focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
              />
              <HiOutlineMail className="absolute left-3.5 top-3.5 text-neutral-500 text-lg" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-neutral-400 hover:text-white transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full bg-neutral-900 text-sm text-white pl-10 pr-4 py-3 rounded-xl border border-neutral-800 focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
              />
              <HiOutlineLockClosed className="absolute left-3.5 top-3.5 text-neutral-500 text-lg" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-white text-black text-xs uppercase font-extrabold tracking-widest rounded-xl hover:bg-neutral-200 transition-colors shadow-lg disabled:opacity-50"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-neutral-800 text-xs text-neutral-400">
          Don't have an account?{" "}
          <Link to="/register" className="font-bold text-white hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
