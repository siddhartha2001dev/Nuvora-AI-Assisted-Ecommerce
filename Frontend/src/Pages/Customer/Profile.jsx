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
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../../redux/slices/authSlice";
import Loader from "../../Components/Common/Loader";
import PhoneInputWithCountry from "../../Components/Common/PhoneInputWithCountry";
import toast from "react-hot-toast";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineLogout,
  HiOutlineLockClosed,
  HiOutlineKey,
  HiOutlineShieldCheck,
  HiOutlineCamera,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineHome,
  HiOutlineOfficeBuilding,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineX,
} from "react-icons/hi";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { user, loading: isLoading } = useSelector((state) => state.auth);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Address Book state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressActionLoading, setAddressActionLoading] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pinCode: "",
    label: "Home",
    isDefault: false,
  });

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    phone: "",
    gender: "",
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
        gender: user.gender || "",
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

  const addresses = user?.addresses || [];

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      fullName: user?.userName || "",
      phone: user?.phone || "",
      street: "",
      city: "",
      state: "",
      pinCode: "",
      label: "Home",
      isDefault: addresses.length === 0,
    });
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      fullName: addr.fullName || "",
      phone: addr.phone || "",
      street: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      pinCode: addr.pinCode || "",
      label: addr.label || "Home",
      isDefault: !!addr.isDefault,
    });
    setShowAddressModal(true);
  };

  const handleCloseAddressModal = () => {
    setShowAddressModal(false);
    setEditingAddress(null);
  };

  const handleAddressInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (
      !addressForm.street.trim() ||
      !addressForm.city.trim() ||
      !addressForm.state.trim() ||
      !addressForm.pinCode.trim()
    ) {
      toast.error("Please fill in Street, City, State, and PIN code");
      return;
    }

    setIsSavingAddress(true);
    try {
      if (editingAddress) {
        await dispatch(
          updateAddress({
            addressId: editingAddress._id,
            ...addressForm,
          })
        ).unwrap();
        toast.success("Address updated successfully!");
      } else {
        await dispatch(addAddress(addressForm)).unwrap();
        toast.success("New address added to Address Book!");
      }
      handleCloseAddressModal();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to save address");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to remove this address from your Address Book?")) return;
    setAddressActionLoading(addressId);
    try {
      await dispatch(deleteAddress(addressId)).unwrap();
      toast.success("Address removed successfully");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to remove address");
    } finally {
      setAddressActionLoading(null);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    setAddressActionLoading(addressId);
    try {
      await dispatch(setDefaultAddress(addressId)).unwrap();
      toast.success("Default delivery address updated!");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to set default address");
    } finally {
      setAddressActionLoading(null);
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

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <span className="inline-flex items-center space-x-1 text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-white text-black shadow-sm">
              <HiOutlineShieldCheck className="text-xs" />
              <span>{isAdmin ? "Store Admin" : "Verified Buyer"}</span>
            </span>
            {user?.gender && user.gender !== "Prefer not to say" && (
              <span className="inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400">
                {user.gender}
              </span>
            )}
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
                <PhoneInputWithCountry
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Mobile phone number"
                />
              </div>

              {/* Gender Selection */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                  Gender
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {["Male", "Female", "Other", "Prefer not to say"].map((option) => {
                    const isSelected = formData.gender === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, gender: option }))}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all text-center ${
                          isSelected
                            ? "bg-white text-black border-white shadow-sm font-semibold"
                            : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              {isAdmin && (
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                    Store Dispatch / Business Address
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
              )}

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

          {/* Address Book Card */}
          <div className="bg-[#121215] border border-neutral-800/80 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white flex items-center space-x-2">
                  <HiOutlineLocationMarker className="text-lg text-white" />
                  <span>Saved Addresses & Address Book ({addresses.length})</span>
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Manage multiple shipping destinations for instant, 1-click checkout.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddAddress}
                className="px-4 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 self-start sm:self-auto transition-colors shadow-sm"
              >
                <HiOutlinePlus className="text-sm" />
                <span>Add Address</span>
              </button>
            </div>

            {/* List of addresses */}
            {addresses.length === 0 ? (
              <div className="text-center py-8 px-4 border border-dashed border-neutral-800 rounded-2xl space-y-3">
                <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
                  <HiOutlineLocationMarker className="text-xl" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">No Addresses Saved Yet</h4>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    Add your Home, Office, or other delivery locations so you don't have to re-enter them during checkout.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddAddress}
                  className="mt-2 px-5 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center space-x-2"
                >
                  <HiOutlinePlus />
                  <span>Add First Address</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const isAddrDefault = !!addr.isDefault;
                  const labelIcon =
                    addr.label === "Work" ? (
                      <HiOutlineOfficeBuilding />
                    ) : addr.label === "Other" ? (
                      <HiOutlineLocationMarker />
                    ) : (
                      <HiOutlineHome />
                    );

                  return (
                    <div
                      key={addr._id}
                      className={`relative rounded-2xl border p-5 space-y-3.5 transition-all flex flex-col justify-between ${
                        isAddrDefault
                          ? "bg-neutral-900/90 border-white/40 shadow-lg"
                          : "bg-[#16161a] border-neutral-800/90 hover:border-neutral-700"
                      }`}
                    >
                      {/* Top Badges & Actions */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center space-x-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300">
                              {labelIcon}
                              <span>{addr.label || "Home"}</span>
                            </span>
                            {isAddrDefault && (
                              <span className="inline-flex items-center space-x-1 text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-400 border border-emerald-700/60">
                                <HiOutlineCheck className="text-xs" />
                                <span>Default</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditAddress(addr)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                              title="Edit address"
                            >
                              <HiOutlinePencil className="text-sm" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr._id)}
                              disabled={addressActionLoading === addr._id}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors disabled:opacity-50"
                              title="Delete address"
                            >
                              <HiOutlineTrash className="text-sm" />
                            </button>
                          </div>
                        </div>

                        {/* Recipient Details */}
                        <div className="pt-1">
                          <h4 className="text-sm font-bold text-white">
                            {addr.fullName || user?.userName || "Valued Customer"}
                          </h4>
                          {addr.phone && (
                            <p className="text-xs text-neutral-400 font-mono mt-0.5">
                              {addr.phone}
                            </p>
                          )}
                        </div>

                        {/* Address Lines */}
                        <p className="text-xs text-neutral-300 leading-relaxed">
                          {addr.street}, {addr.city}, {addr.state} - <span className="font-mono">{addr.pinCode}</span>
                        </p>
                      </div>

                      {/* Bottom Footer Action */}
                      <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                        {!isAddrDefault ? (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr._id)}
                            disabled={addressActionLoading === addr._id}
                            className="text-[11px] text-neutral-400 hover:text-white font-semibold transition-colors flex items-center space-x-1 disabled:opacity-50"
                          >
                            <HiOutlineCheck className="text-xs" />
                            <span>Set as Default</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-neutral-500 font-medium">
                            Primary Shipping Address
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Enter current password"
                    className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white pl-10 pr-11 py-3 rounded-xl focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                  />
                  <HiOutlineLockClosed className="absolute left-3.5 top-3.5 text-neutral-500 text-lg" />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-white transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? (
                      <HiOutlineEyeOff className="text-lg" />
                    ) : (
                      <HiOutlineEye className="text-lg" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Minimum 6 characters"
                      className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white pl-10 pr-11 py-3 rounded-xl focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                    />
                    <HiOutlineLockClosed className="absolute left-3.5 top-3.5 text-neutral-500 text-lg" />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-white transition-colors focus:outline-none"
                      tabIndex={-1}
                    >
                      {showNewPassword ? (
                        <HiOutlineEyeOff className="text-lg" />
                      ) : (
                        <HiOutlineEye className="text-lg" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Repeat new password"
                      className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white pl-10 pr-11 py-3 rounded-xl focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                    />
                    <HiOutlineLockClosed className="absolute left-3.5 top-3.5 text-neutral-500 text-lg" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-white transition-colors focus:outline-none"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <HiOutlineEyeOff className="text-lg" />
                      ) : (
                        <HiOutlineEye className="text-lg" />
                      )}
                    </button>
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

      {/* Address Form Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121215] border border-neutral-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white font-['Syne',sans-serif]">
                  {editingAddress ? "Edit Delivery Address" : "Add New Delivery Address"}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Save this address for fast checkout on your orders.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseAddressModal}
                className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <HiOutlineX className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleAddressSubmit} className="space-y-4">
              {/* Address Label Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                  Address Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Home", "Work", "Other"].map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setAddressForm((prev) => ({ ...prev, label }))}
                      className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center justify-center space-x-1.5 ${
                        addressForm.label === label
                          ? "bg-white text-black border-white shadow-md"
                          : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700"
                      }`}
                    >
                      {label === "Home" && <HiOutlineHome />}
                      {label === "Work" && <HiOutlineOfficeBuilding />}
                      {label === "Other" && <HiOutlineLocationMarker />}
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                    Recipient Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={addressForm.fullName}
                    onChange={handleAddressInputChange}
                    placeholder="Name for parcel delivery"
                    className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                    Contact Phone Number
                  </label>
                  <PhoneInputWithCountry
                    name="phone"
                    value={addressForm.phone}
                    onChange={handleAddressInputChange}
                    placeholder="Mobile number"
                  />
                </div>
              </div>

              {/* Street Address */}
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                  Flat, House no., Building, Street, Area *
                </label>
                <textarea
                  rows={2}
                  name="street"
                  value={addressForm.street}
                  onChange={handleAddressInputChange}
                  required
                  placeholder="e.g. Flat 402, Sunshine Heights, MG Road"
                  className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                />
              </div>

              {/* City, State, PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={addressForm.city}
                    onChange={handleAddressInputChange}
                    required
                    placeholder="e.g. Mumbai"
                    className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={addressForm.state}
                    onChange={handleAddressInputChange}
                    required
                    placeholder="e.g. Maharashtra"
                    className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    name="pinCode"
                    value={addressForm.pinCode}
                    onChange={handleAddressInputChange}
                    required
                    placeholder="e.g. 400001"
                    className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600 font-mono"
                  />
                </div>
              </div>

              {/* Set as Default Toggle */}
              <label className="flex items-center space-x-3 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={addressForm.isDefault}
                  onChange={handleAddressInputChange}
                  className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 text-black focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-neutral-300 font-medium">
                  Set as default delivery address
                </span>
              </label>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={handleCloseAddressModal}
                  className="px-5 py-2.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="px-6 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-extrabold uppercase tracking-wider transition-colors shadow-lg disabled:opacity-50"
                >
                  {isSavingAddress ? "Saving..." : editingAddress ? "Update Address" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
