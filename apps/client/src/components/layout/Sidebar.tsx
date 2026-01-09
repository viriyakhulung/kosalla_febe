"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem, Role } from "@/types";

interface SidebarProps {
  userRole: Role;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ userRole, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Menu items sesuai role
  const menuItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: "📊",
      roles: ["super-admin", "engineer-manager", "engineer-staff", "enduser"],
    },
    {
      label: "Tickets",
      href: "/portal/tickets",
      icon: "🎫",
      roles: ["enduser"],
    },
    {
      label: "Create Ticket",
      href: "/portal/tickets/create",
      icon: "➕",
      roles: ["enduser"],
    },
    {
      label: "Admin",
      icon: "⚙️",
      href: "/admin",
      roles: ["super-admin"],
      children: [
        {
          label: "Users",
          href: "/admin/users",
          roles: ["super-admin"],
        },
        {
          label: "Organizations",
          href: "/admin/organizations",
          roles: ["super-admin"],
        },
        {
          label: "Locations",
          href: "/admin/locations",
          roles: ["super-admin"],
        },
        {
          label: "Contracts",
          href: "/admin/contracts",
          roles: ["super-admin"],
        },
      ],
    },
    {
      label: "Engineer",
      icon: "🔧",
      href: "/engineer",
      roles: ["engineer-manager", "engineer-staff"],
    },
    {
      label: "Profile",
      href: "/profile",
      icon: "👤",
      roles: ["super-admin", "engineer-manager", "engineer-staff", "enduser"],
    },
  ];

  // Filter menu berdasarkan role
  const filteredMenu = menuItems.filter((item) =>
    item.roles?.includes(userRole)
  );

  const isActive = (href: string) => pathname === href;

  return (
    <aside
      className={`${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 fixed lg:relative w-64 h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white transition-transform duration-300 z-40 overflow-y-auto border-r border-slate-800`}
    >
      {/* Logo section */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">
            K
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Kosalla</h1>
            <p className="text-xs text-slate-400">Ticketing System</p>
          </div>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="p-4 space-y-1">
        {filteredMenu.map((item) => (
          <div key={item.href}>
            <Link
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.href)
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-lg w-5 flex-shrink-0">{item.icon}</span>
              <span className="font-medium text-sm flex-1">{item.label}</span>
              {item.children && (
                <svg
                  className={`w-4 h-4 transition-transform ${isActive(item.href) ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
            </Link>

            {/* Submenu */}
            {item.children && isActive(item.href) && (
              <div className="ml-4 mt-2 pl-4 border-l border-slate-700 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onClose}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      isActive(child.href)
                        ? "bg-blue-600/30 text-blue-300 font-medium"
                        : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    <span>{child.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 bg-slate-950/50 space-y-3">
        <div className="px-3 py-2 bg-slate-800/50 rounded-lg">
          <p className="text-xs text-slate-400 font-medium">Version</p>
          <p className="text-sm text-slate-300 font-semibold">1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
