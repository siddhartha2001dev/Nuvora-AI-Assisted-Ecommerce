import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { verifyEmailThunk } from "../../redux/slices/authSlice";
import toast from "react-hot-toast";
import { HiOutlineCheckCircle, HiOutlineArrowRight, HiOutlineMail, HiOutlineKey } from "react-icons/hi";

const VerifyMail = () => {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [inputToken, setInputToken] = useState(tokenParam);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();

  const handleVerify = async (tok) => {
    const tokenToUse = tok || inputToken;
    if (!tokenToUse) {
      toast.error("Please provide a verification token");
      return;
    }

    setIsLoading(true);
    try {
      const res = await dispatch(verifyEmailThunk(tokenToUse)).unwrap();
      setIsVerified(true);
      toast.success(res?.message || "Email verified successfully!");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Verification failed. Token may be invalid or expired.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tokenParam) {
      handleVerify(tokenParam);
    }
  }, [tokenParam]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-[#121215] border border-neutral-800/80 rounded-3xl p-8 sm:p-10 text-center shadow-2xl space-y-6">
        <div className="w-16 h-16 bg-neutral-900 border border-neutral-700 text-white rounded-full flex items-center justify-center mx-auto">
          {isVerified ? (
            <HiOutlineCheckCircle className="text-3xl text-emerald-400" />
          ) : (
            <HiOutlineMail className="text-3xl text-neutral-300" />
          )}
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest font-mono text-neutral-500">
            EMAIL CONFIRMATION
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-['Syne',sans-serif]">
            {isVerified ? "Account Verified" : "Verify Your Email"}
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed">
            {isVerified
              ? "Your email has been authenticated. You now have full access to your Nuvora account."
              : emailParam
              ? `We sent a verification link to ${emailParam}. Click the link or paste the token below.`
              : "Please verify your email address to activate your account."}
          </p>
        </div>

        {!isVerified ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify(inputToken);
            }}
            className="space-y-3 pt-2 text-left"
          >
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
              Verification Token
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder="Paste JWT verification token..."
                className="w-full bg-neutral-900 text-xs text-white pl-10 pr-4 py-3 rounded-xl border border-neutral-800 focus:outline-none focus:border-white transition-colors"
              />
              <HiOutlineKey className="absolute left-3.5 top-3.5 text-neutral-500 text-base" />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-white text-black text-xs uppercase font-extrabold tracking-widest rounded-xl hover:bg-neutral-200 transition-colors shadow-lg disabled:opacity-50"
            >
              {isLoading ? "Verifying Token..." : "Confirm & Verify Email"}
            </button>
          </form>
        ) : (
          <div className="pt-4">
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center space-x-2 py-3.5 bg-white text-black text-xs uppercase font-extrabold tracking-widest rounded-xl hover:bg-neutral-200 transition-colors shadow-lg"
            >
              <span>Proceed to Sign In</span>
              <HiOutlineArrowRight />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyMail;
