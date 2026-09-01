import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForgotPasswordMutation } from "../../redux/apiSlice";
import toast from "react-hot-toast";
import { HiOutlineMail, HiOutlineArrowLeft, HiOutlineCheckCircle } from "react-icons/hi";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const [forgotPasswordApi, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your registered email address");
      return;
    }

    try {
      const res = await forgotPasswordApi({ email }).unwrap();
      toast.success(res?.message || "Reset link sent to your email!");
      setIsSubmitted(true);
      if (res?.resetToken) {
        setResetToken(res.resetToken);
      }
    } catch (err) {
      toast.error(err?.data?.message || "No account found with this email");
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
            Forgot Password
          </h1>
          <p className="text-xs text-neutral-400">
            Enter your email to receive a password reset link
          </p>
        </div>

        {isSubmitted ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-lg">
              <HiOutlineCheckCircle />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Check Your Inbox</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                We sent a password reset link to <span className="text-white font-bold">{email}</span>.
              </p>
            </div>

            {/* Direct Quick Link in Dev Mode */}
            {resetToken && (
              <div className="pt-2">
                <Link
                  to={`/reset-password?token=${resetToken}`}
                  className="inline-block px-5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs font-bold text-white hover:bg-neutral-800 transition-colors"
                >
                  Click Here to Set New Password →
                </Link>
              </div>
            )}

            <div className="pt-4 border-t border-neutral-800">
              <Link
                to="/login"
                className="inline-flex items-center space-x-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
              >
                <HiOutlineArrowLeft />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                Registered Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full bg-neutral-900 text-sm text-white pl-10 pr-4 py-3 rounded-xl border border-neutral-800 focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                />
                <HiOutlineMail className="absolute left-3.5 top-3.5 text-neutral-500 text-lg" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-white text-black text-xs uppercase font-extrabold tracking-widest rounded-xl hover:bg-neutral-200 transition-colors shadow-lg disabled:opacity-50"
            >
              {isLoading ? "Sending Link..." : "Send Reset Link"}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center space-x-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
              >
                <HiOutlineArrowLeft />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
