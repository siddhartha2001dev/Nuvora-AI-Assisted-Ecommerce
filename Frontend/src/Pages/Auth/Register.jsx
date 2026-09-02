import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../redux/slices/authSlice";
import toast from "react-hot-toast";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlinePhone,
} from "react-icons/hi";

const Register = () => {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading: isLoading } = useSelector((state) => state.auth);

  // Explicitly clear fields on mount
  useEffect(() => {
    setFormData({
      userName: "",
      email: "",
      password: "",
      phone: "",
      address: "",
    });
  }, [location.pathname]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.userName || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const payload = {
        userName: formData.userName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: "Buyer",
        address: formData.address,
      };

      const res = await dispatch(registerUser(payload)).unwrap();

      toast.success(res?.message || "Registered successfully! Please verify your email.");
      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}&token=${res?.token || ""}`);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg bg-[#121215] border border-neutral-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-widest font-mono text-neutral-500">
            JOIN NUVORA
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-['Syne',sans-serif]">
            Create Account
          </h1>
          <p className="text-xs text-neutral-400">
            Experience curated modern essentials and fast delivery
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                required
                autoComplete="name"
                placeholder="e.g. Siddharth Verma"
                className="w-full bg-neutral-900 text-sm text-white pl-10 pr-4 py-3 rounded-xl border border-neutral-800 focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
              />
              <HiOutlineUser className="absolute left-3.5 top-3.5 text-neutral-500 text-lg" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                placeholder="name@example.com"
                className="w-full bg-neutral-900 text-sm text-white pl-10 pr-4 py-3 rounded-xl border border-neutral-800 focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
              />
              <HiOutlineMail className="absolute left-3.5 top-3.5 text-neutral-500 text-lg" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full bg-neutral-900 text-sm text-white pl-10 pr-4 py-3 rounded-xl border border-neutral-800 focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                />
                <HiOutlineLockClosed className="absolute left-3.5 top-3.5 text-neutral-500 text-lg" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  placeholder="+91 9876543210"
                  className="w-full bg-neutral-900 text-sm text-white pl-10 pr-4 py-3 rounded-xl border border-neutral-800 focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                />
                <HiOutlinePhone className="absolute left-3.5 top-3.5 text-neutral-500 text-lg" />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-white text-black text-xs uppercase font-extrabold tracking-widest rounded-xl hover:bg-neutral-200 transition-colors shadow-lg disabled:opacity-50"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-neutral-800 text-xs text-neutral-400">
          Already registered?{" "}
          <Link to="/login" className="font-bold text-white hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
