"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { User } from "@/types";
import { logout } from "@/lib/auth";

interface HeaderProps {
  user: User;
  onMenuToggle: () => void;
}

export function Header({ user, onMenuToggle }: HeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  const userInitial = user.name?.charAt(0).toUpperCase() || "U";
  const roleLabel = user.roles?.[0] || "User";
  const roleColor = roleLabel === "super_admin" || roleLabel === "superadmin" ? "bg-purple-600" : "bg-blue-600";

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex justify-between items-center">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6 text-slate-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Logo/Brand area (visible on mobile in sidebar) */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <span className="font-semibold text-slate-900 hidden sm:inline">Kosalla</span>
        </div>
      </div>

      {/* Right Section - User Info */}
      <div className="flex items-center gap-6">
        {/* Status indicator */}
        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-slate-600 font-medium">System Active</span>
        </div>

        {/* User Info */}
        <div className="hidden sm:block text-right">
          <p className="text-sm font-semibold text-slate-900">{user.name}</p>
          <p className={`text-xs font-medium px-2 py-0.5 rounded-full text-white w-fit mt-1 ${roleColor}`}>
            {roleLabel.replace("_", " ").toUpperCase()}
          </p>
        </div>

        {/* User Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`w-10 h-10 rounded-full ${roleColor} text-white flex items-center justify-center font-semibold hover:opacity-90 transition-all hover:shadow-lg`}
            title={user.name}
          >
            {userInitial}
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                <p className="text-sm font-bold text-slate-900">
                  {user.name}
                </p>
                <p className="text-xs text-slate-600 mt-1">{user.email}</p>
                <span className={`inline-block mt-2 text-xs font-semibold px-2 py-1 rounded-full text-white ${roleColor}`}>
                  {roleLabel.replace("_", " ").toUpperCase()}
                </span>
              </div>

              <nav className="p-2 space-y-1">
                <a
                  href="/profile"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile</span>
                </a>
                <a
                  href="/settings"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </a>
              </nav>

              <div className="p-2 border-t border-slate-200">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-lg disabled:opacity-50 transition-colors font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
