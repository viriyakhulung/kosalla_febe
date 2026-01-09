"use client";

import Link from "next/link";

export default function AdminPage() {
  const externalSetupItems = [
    {
      title: "Users",
      description: "Kelola akun pengguna sistem",
      href: "/admin/users",
      icon: "👥",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Organization",
      description: "Setup dan kelola organisasi",
      href: "/admin/organizations",
      icon: "🏢",
      color: "from-cyan-500 to-cyan-600"
    },
    {
      title: "Location",
      description: "Kelola lokasi operasional",
      href: "/admin/locations",
      icon: "📍",
      color: "from-emerald-500 to-emerald-600"
    },
    {
      title: "Product Types",
      description: "Kelola tipe produk & layanan",
      href: "/admin/product-types",
      icon: "📦",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Contracts",
      description: "Kelola kontrak & perjanjian",
      href: "/admin/contracts",
      icon: "📋",
      color: "from-orange-500 to-orange-600"
    },
  ];

  const internalSetupItems = [
    {
      title: "Engineers",
      description: "Kelola engineer dan skill",
      href: "/admin/engineers",
      icon: "🔧",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      title: "Team Groups",
      description: "Buat dan kelola grup tim",
      href: "/admin/team-groups",
      icon: "👨‍💼",
      color: "from-pink-500 to-pink-600"
    },
    {
      title: "Team Members",
      description: "Kelola anggota & role tim",
      href: "/admin/team-members",
      icon: "👤",
      color: "from-rose-500 to-rose-600"
    },
  ];

  const MenuCard = ({ title, description, href, icon, color }: any) => (
    <Link
      href={href}
      className="group relative overflow-hidden bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>

      <div className="p-6 relative z-10">
        {/* Icon background */}
        <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
          <span className="text-2xl">{icon}</span>
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold text-slate-900 mb-1.5">{title}</h3>
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{description}</p>

        {/* Footer */}
        <div className={`flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${color} bg-clip-text text-transparent group-hover:gap-3 transition-all`}>
          <span>Buka</span>
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Bottom border accent */}
      <div className={`h-1 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
    </Link>
  );

  return (
    <div className="space-y-12 p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header section */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-10 bg-gradient-to-b from-blue-600 to-cyan-600 rounded-full"></div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 mt-1 text-base">Kelola sistem Kosalla dan konfigurasi lengkap untuk operasional tim</p>
          </div>
        </div>
      </div>

      {/* External Setup Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <h2 className="text-2xl font-bold text-slate-900">Setup Eksternal</h2>
          <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">Client Facing</span>
        </div>
        <p className="text-slate-600 ml-5 text-sm">Konfigurasi entitas yang terhubung dengan klien eksternal</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mt-6">
          {externalSetupItems.map((item) => (
            <MenuCard key={item.href} {...item} />
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4 py-4">
        <div className="flex-1 h-px bg-slate-300"></div>
        <span className="text-slate-500 text-sm font-medium">atau</span>
        <div className="flex-1 h-px bg-slate-300"></div>
      </div>

      {/* Internal Setup Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
          <h2 className="text-2xl font-bold text-slate-900">Setup Internal</h2>
          <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">Team Management</span>
        </div>
        <p className="text-slate-600 ml-5 text-sm">Kelola struktur tim, engineer, dan konfigurasi internal Viriya</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {internalSetupItems.map((item) => (
            <MenuCard key={item.href} {...item} />
          ))}
        </div>
      </section>

      {/* Info cards */}
      <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-6 border border-slate-200 hover:border-slate-300 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl">ℹ️</div>
            <div>
              <h3 className="font-semibold text-slate-900">Tips</h3>
              <p className="text-slate-600 text-sm mt-1">Mulai dengan setup eksternal terlebih dahulu sebelum internal</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-slate-200 hover:border-slate-300 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-xl">✓</div>
            <div>
              <h3 className="font-semibold text-slate-900">Bantuan</h3>
              <p className="text-slate-600 text-sm mt-1">Hubungi tim support jika membutuhkan bantuan setup</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-slate-200 hover:border-slate-300 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-xl">📚</div>
            <div>
              <h3 className="font-semibold text-slate-900">Dokumentasi</h3>
              <p className="text-slate-600 text-sm mt-1">Lihat panduan lengkap di knowledge base kami</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
