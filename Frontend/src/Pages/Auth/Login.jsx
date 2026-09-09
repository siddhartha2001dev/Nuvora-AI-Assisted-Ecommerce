import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, googleLoginUser } from "../../redux/slices/authSlice";
import toast from "react-hot-toast";
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "492327953955-uuvcd3l43o020vrsu661j29f580c1ep7.apps.googleusercontent.com";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const googleBtnRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading: isLoading } = useSelector((state) => state.auth);

  // Explicitly clear fields on mount or navigation
  useEffect(() => {
    setEmail("");
    setPassword("");
  }, [location.pathname]);

  const redirectTarget = location.state?.from
    ? typeof location.state.from === "string"
      ? location.state.from
      : `${location.state.from.pathname || "/"}${location.state.from.search || ""}${location.state.from.hash || ""}`
    : "/";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      const res = await dispatch(loginUser({ email, password })).unwrap();

      // Clear fields immediately on success
      setEmail("");
      setPassword("");

      toast.success(`Welcome back, ${res?.data?.userName || "User"}!`);

      // If Admin or Seller, redirect to Admin Dashboard
      if (res?.data?.role === "Seller" || res?.data?.role === "Admin") {
        navigate("/seller/dashboard");
      } else {
        navigate(redirectTarget === "/login" ? "/" : redirectTarget, { replace: true });
      }
    } catch (err) {
      const errorMsg =
        typeof err === "string" ? err : "Invalid credentials. Please verify your email or password.";
      toast.error(errorMsg);

      // If unverified email error, provide link to verify
      if (errorMsg.toLowerCase().includes("verify your email")) {
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        }, 1500);
      }
    }
  };

  // Google Identity Services Setup
  useEffect(() => {
    const googleClientId = GOOGLE_CLIENT_ID;
    if (!googleClientId) return;

    const handleGoogleResponse = async (response) => {
      try {
        const res = await dispatch(googleLoginUser(response.credential)).unwrap();
        toast.success(`Welcome, ${res?.data?.userName || "User"}!`);
        if (res?.data?.role === "Seller" || res?.data?.role === "Admin") {
          navigate("/seller/dashboard");
        } else {
          navigate(redirectTarget === "/login" ? "/" : redirectTarget, { replace: true });
        }
      } catch (err) {
        toast.error(typeof err === "string" ? err : "Google sign-in failed");
      }
    };

    const initGoogle = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleResponse,
            auto_select: false,
          });

          const containerWidth = googleBtnRef.current.parentElement?.offsetWidth || 340;
          const buttonWidth = Math.max(220, Math.min(containerWidth, 380));

          googleBtnRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "filled_black",
            size: "large",
            width: buttonWidth,
            text: "signin_with",
            shape: "rectangular",
            logo_alignment: "left",
          });

          // Check if Google successfully mounted an iframe inside the button container
          setTimeout(() => {
            if (googleBtnRef.current && googleBtnRef.current.children.length > 0) {
              setGoogleReady(true);
            }
          }, 300);
        } catch (err) {
          console.error("Google Auth initialization error:", err);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const existingScript = document.getElementById("google-gsi-client");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "google-gsi-client";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initGoogle;
        document.body.appendChild(script);
      } else {
        existingScript.addEventListener("load", initGoogle);
      }
    }
  }, [dispatch, navigate, redirectTarget]);

  const handleGoogleSignIn = () => {
    const googleClientId = GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      toast.error("Google Client ID is missing.");
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          const reason =
            (notification.getNotDisplayedReason && notification.getNotDisplayedReason()) ||
            (notification.getSkippedReason && notification.getSkippedReason()) ||
            "";
          console.warn("Google One Tap prompt skipped/not displayed:", reason);
          toast.error(
            "Google sign-in blocked: Origin not authorized. Please verify Authorized Origins in Google Cloud Console.",
            { duration: 5000 }
          );
        }
      });
    } else {
      toast.error("Google Auth is loading, please try again in a moment");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-[#121215] border border-neutral-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
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
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full bg-neutral-900 text-sm text-white pl-10 pr-11 py-3 rounded-xl border border-neutral-800 focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
              />
              <HiOutlineLockClosed className="absolute left-3.5 top-3.5 text-neutral-500 text-lg" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-white transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <HiOutlineEyeOff className="text-lg" />
                ) : (
                  <HiOutlineEye className="text-lg" />
                )}
              </button>
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

        {/* Divider & Social Sign-In */}
        <div className="space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-neutral-800/80 w-full" />
            <span className="bg-[#121215] px-3 text-[11px] uppercase tracking-widest text-neutral-500 font-mono shrink-0">
              Or continue with
            </span>
            <div className="border-t border-neutral-800/80 w-full" />
          </div>

          <div className="space-y-2.5">
            {/* Native Google Sign-In Button Container */}
            <div
              className={`w-full flex justify-center items-center transition-all duration-200 ${
                googleReady ? "min-h-[44px] opacity-100" : "h-0 overflow-hidden opacity-0 pointer-events-none"
              }`}
            >
              <div
                ref={googleBtnRef}
                className="w-full flex justify-center items-center"
              />
            </div>

            {/* Fallback button shown while Google SDK is loading or if Google fails to mount */}
            {!googleReady && (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-neutral-800 bg-[#16161a] hover:bg-[#1e1e24] hover:border-neutral-700 text-neutral-200 hover:text-white text-xs font-semibold tracking-wide transition-all duration-200 active:scale-[0.99] shadow-sm cursor-pointer group"
              >
                <FcGoogle className="text-xl shrink-0 group-hover:scale-105 transition-transform" />
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-neutral-800 text-xs text-neutral-400">
          Don't have an account?{" "}
          <Link to="/register" state={{ from: redirectTarget }} className="font-bold text-white hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
