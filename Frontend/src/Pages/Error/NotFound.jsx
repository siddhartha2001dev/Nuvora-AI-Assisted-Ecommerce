import React from "react";
import { Link } from "react-router-dom";
import { HiOutlineArrowLeft } from "react-icons/hi";

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-6">
        <span className="text-7xl font-extrabold tracking-widest text-neutral-800 font-mono">
          404
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-['Syne',sans-serif]">
          Page Not Found
        </h1>
        <p className="text-xs text-neutral-400 leading-relaxed max-w-sm mx-auto">
          The essential piece or page you are looking for has moved, expired, or does not exist in our catalogue.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-8 py-3.5 bg-white text-black text-xs uppercase font-extrabold tracking-widest rounded-xl hover:bg-neutral-200 transition-colors shadow-xl"
          >
            <HiOutlineArrowLeft />
            <span>Return to Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
