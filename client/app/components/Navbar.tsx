"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useSocket } from "./SocketProvider";

const Navbar = () => {
  const { data: session } = useSession();
  const { notifications, setNotifications } = useSocket(); 
  const [isOpen, setIsOpen] = useState(false);

  console.log(notifications)

  return (
    <div className="navbar flex justify-between p-4 relative">
      <div className="flex items-center gap-2">
        <a className="font-mono text-3xl font-extrabold">ChatPro</a>
        <img src="/logo.jpg" className="w-10 h-10" alt="Logo" />
      </div>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search"
          className="input input-bordered w-24 md:w-auto"
        />

        <div className="relative cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <Bell size={24} className="text-gray-600" />
          {notifications.length > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
              {notifications.length}
            </span>
          )}
        </div>

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-10 top-14 w-80 bg-white shadow-lg rounded-lg p-4"
          >
            <h3 className="font-bold text-lg mb-2">Notifications</h3>
            {notifications.length === 0 ? (
              <p className="text-gray-500">No new notifications</p>
            ) : (
              <ul className="max-h-60 overflow-y-auto">
                {notifications.map((notif, index) => (
                  <li key={index} className="p-2 border-b text-gray-700">
                    {notif.message}
                  </li>
                ))}
              </ul>
            )}
            <button
              className="mt-3 text-blue-600 hover:underline"
              onClick={() => setNotifications([])}
            >
              Clear All
            </button>
          </motion.div>
        )}
        {session?.user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img alt="User Profile" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
              </div>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
              <li><a>Settings</a></li>
              <li><button onClick={() => signOut()}>Logout</button></li>
            </ul>
          </div>
        ) : (
          <button className="btn btn-neutral">Login/SignUp</button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
