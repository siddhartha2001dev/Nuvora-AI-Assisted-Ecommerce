import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HiOutlineViewGrid,
  HiOutlineClipboardList,
  HiOutlineShoppingBag,
} from "react-icons/hi";

const SellerSidebar = () => {
  const location = useLocation();

  const links = [
    {
      name: "Dashboard & Products",
      path: "/seller/dashboard",
      icon: HiOutlineViewGrid,
    },
    {
      name: "Customer Orders",
      path: "/seller/orders",
      icon: HiOutlineClipboardList,
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-[#121215] border border-neutral-800/80 rounded-2xl p-5 space-y-6 h-fit shrink-0">
      {/* Seller Store Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-neutral-800">
        <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold font-['Syne',sans-serif]">
          <HiOutlineShoppingBag className="text-xl" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">NUVORA Official</h3>
          <p className="text-[11px] text-neutral-500 font-mono">STORE OWNER PANEL</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="space-y-1.5">
        {links.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                isActive
                  ? "bg-white text-black shadow-md font-bold"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <Icon className="text-lg" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default SellerSidebar;
