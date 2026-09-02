import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resetPassword } from "../../redux/slices/authSlice";
import toast from "react-hot-toast";
import { HiOutlineLockClosed, HiOutlineKey, HiOutlineCheckCircle } from "react-icons/hi";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing reset token. Please request a new link.");
      return;
    }

    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await dispatch(resetPassword({ token, newPassword })).unwrap();
      toast.success(res?.message || "Password reset successfully!");
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Reset link has expired or is invalid");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-[#121215] border border-neutral-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-widest font-mono text-neutral-500">
            SECURITY RECOVERY
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-['Syne',sans-serif]">
            Set New Password
          </h1>
          <p className="text-xs text-neutral-400">
            Create a strong new password for your Nuvora account
          </p>
        </div>

        {isSuccess ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-lg">
              <HiOutlineCheckCircle />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Password Updated!</h3>
              <p className="text-xs text-neutral-400">
                Your password has been changed. Redirecting to Sign In...
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-block w-full py-3.5 bg-white text-black text-xs uppercase font-extrabold tracking-widest rounded-xl hover:bg-neutral-200 transition-colors shadow-lg"
              >
                Sign In Now
              </Link>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                New Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Minimum 6 characters"
                  className="w-full bg-neutral-900 text-sm text-white pl-10 pr-4 py-3 rounded-xl border border-neutral-800 focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                />
                <HiOutlineLockClosed className="absolute left-3.5 top-3.5 text-neutral-500 text-lg" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat new password"
                  className="w-full bg-neutral-900 text-sm text-white pl-10 pr-4 py-3 rounded-xl border border-neutral-800 focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                />
                <HiOutlineKey className="absolute left-3.5 top-3.5 text-neutral-500 text-lg" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-white text-black text-xs uppercase font-extrabold tracking-widest rounded-xl hover:bg-neutral-200 transition-colors shadow-lg disabled:opacity-50"
              >
                {isLoading ? "Updating..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
