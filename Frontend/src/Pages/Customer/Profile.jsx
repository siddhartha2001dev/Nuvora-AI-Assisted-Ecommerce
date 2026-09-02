import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchProfile,
  updateProfile,
  uploadProfilePicture,
  changePassword,
  logoutUser,
  updateUserData,
} from "../../redux/slices/authSlice";
import Loader from "../../Components/Common/Loader";
import toast from "react-hot-toast";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineLogout,
  HiOutlineLockClosed,
  HiOutlineKey,
  HiOutlineShieldCheck,
  HiOutlineCamera,
} from "react-icons/hi";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { user, loading: isLoading } = useSelector((state) => state.auth);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    phone: "",
    address: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        userName: user.userName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    setIsUpdating(true);
    try {
      const res = await dispatch(updateProfile(formData)).unwrap();
      dispatch(updateUserData(res?.data || { ...user, ...formData }));
      toast.success("Profile details updated successfully!");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error("Please enter both current and new password");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setIsChangingPass(true);
    try {
      await dispatch(
        changePassword({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        })
      ).unwrap();

      toast.success("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to change password. Please check your current password.");
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 5MB) and type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, JPEG, WEBP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const uploadData = new FormData();
    uploadData.append("avatar", file);

    const toastId = toast.loading("Uploading profile picture...");
    setIsUploadingPic(true);
    try {
      const res = await dispatch(uploadProfilePicture(uploadData)).unwrap();
      dispatch(updateUserData(res?.data || { ...user, avatarUrl: res?.avatarUrl }));
      toast.success("Profile picture updated successfully!", { id: toastId });
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to upload profile picture", { id: toastId });
    } finally {
      setIsUploadingPic(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success("Logged out successfully");
    navigate("/login");
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader text="Loading profile details..." />
      </div>
    );
  }

  const initials = user?.userName
    ? user.userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "NV";

  const isAdmin = user?.role === "Admin" || user?.role === "Seller";
  const isBuyer = !isAdmin;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8">
      {/* Title */}
      <div className="border-b border-neutral-800 pb-6">
        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-neutral-500">
          ACCOUNT SETTINGS
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-['Syne',sans-serif]">
          {isAdmin ? "Admin Profile" : "Customer Profile"}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {/* User Avatar Card */}
        <div className="md:col-span-1 bg-[#121215] border border-neutral-800/80 rounded-3xl p-6 text-center space-y-4 h-fit">
          {/* Avatar Picture with Buyer Upload Trigger */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto group">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.userName || "Avatar"}
                className="w-full h-full rounded-full object-cover border-2 border-neutral-700 shadow-xl"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-neutral-900 border-2 border-neutral-700 flex items-center justify-center text-2xl sm:text-3xl font-bold text-white font-['Syne',sans-serif] shadow-xl">
                {initials}
              </div>
            )}

            {/* Buyer Only Upload Camera Button */}
            {isBuyer && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPic}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-white text-black hover:bg-neutral-200 border-2 border-[#121215] shadow-lg transition-transform active:scale-90 disabled:opacity-50"
                  title="Upload profile picture"
                >
                  <HiOutlineCamera className="text-base" />
                </button>
              </>
            )}
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {user?.userName || "Nuvora Member"}
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">{user?.email}</p>
            {isBuyer && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPic}
                className="text-[11px] text-neutral-400 hover:text-white mt-1.5 underline decoration-dotted transition-colors"
              >
                {isUploadingPic ? "Uploading..." : "Change Profile Photo"}
              </button>
            )}
          </div>

          <div className="flex items-center justify-center space-x-1.5">
            <span className="inline-flex items-center space-x-1 text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-white text-black shadow-sm">
              <HiOutlineShieldCheck className="text-xs" />
              <span>{isAdmin ? "Store Admin" : "Verified Buyer"}</span>
            </span>
          </div>

          <div className="pt-4 border-t border-neutral-800">
            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl border border-neutral-800 bg-neutral-900 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-rose-400 transition-colors flex items-center justify-center space-x-2"
            >
              <HiOutlineLogout className="text-base" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Right Side: Profile Edit & Password Change */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Edit Form */}
          <div className="bg-[#121215] border border-neutral-800/80 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                Personal & Contact Details
              </h3>
            </div>

            <form className="space-y-4" onSubmit={handleUpdate}>
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors"
                  />
                  <HiOutlineUser className="absolute left-3.5 top-3.5 text-neutral-500 text-lg" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors"
                  />
                  <HiOutlineMail className="absolute left-3.5 top-3.5 text-neutral-500 text-lg" />
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
                    placeholder="+91 9876543210"
                    className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors"
                  />
                  <HiOutlinePhone className="absolute left-3.5 top-3.5 text-neutral-500 text-lg" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                  {isAdmin ? "Store Dispatch / Business Address" : "Default Delivery Address"}
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street, City, State, PIN..."
                    className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors"
                  />
                  <HiOutlineLocationMarker className="absolute left-3.5 top-3.5 text-neutral-500 text-lg" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full sm:w-auto px-8 py-3.5 bg-white text-black text-xs uppercase font-extrabold tracking-widest rounded-xl hover:bg-neutral-200 transition-colors shadow-lg disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save Profile Details"}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-[#121215] border border-neutral-800/80 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-2.5 border-b border-neutral-800 pb-4">
              <HiOutlineKey className="text-lg text-white" />
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                Change Password & Security
              </h3>
            </div>

            <form className="space-y-4" onSubmit={handleChangePasswordSubmit}>
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Enter current password"
                    className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                  />
                  <HiOutlineLockClosed className="absolute left-3.5 top-3.5 text-neutral-500 text-lg" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Minimum 6 characters"
                      className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
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
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Repeat new password"
                      className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                    />
                    <HiOutlineLockClosed className="absolute left-3.5 top-3.5 text-neutral-500 text-lg" />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="w-full sm:w-auto px-8 py-3.5 bg-neutral-900 text-white border border-neutral-700 hover:bg-neutral-800 text-xs uppercase font-extrabold tracking-widest rounded-xl transition-colors shadow-lg disabled:opacity-50"
                >
                  {isChangingPass ? "Updating Password..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
