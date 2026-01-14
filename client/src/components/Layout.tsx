import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Sidebar: React.FC = () => {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-blue-700 to-indigo-700 text-white shadow-lg">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-white/10">
        <div className="w-8 h-8 rounded bg-white/20" />
        <div>
          <div className="text-sm uppercase tracking-wider opacity-80">Procurement</div>
          <div className="font-semibold">Gas Negara</div>
        </div>
      </div>
      <nav className="px-4 py-4 space-y-2">
        <Link to="#" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10">
          <span className="text-sm">Dashboard</span>
        </Link>
        <Link to="#" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10">
          <span className="text-sm">Profile</span>
        </Link>
        <Link to="#" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10">
          <span className="text-sm">Reports</span>
        </Link>
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-4 text-xs opacity-70">
        Copyright © PGN Gas
      </div>
    </aside>
  );
};

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-10 bg-white shadow">
      <div className="px-8 mx-auto max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <div />
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">{user?.name || user?.email}</span>
            <button
              onClick={logout}
              className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

const Layout: React.FC<{ children: React.ReactNode; title?: string; info?: string }> = ({
  children,
  title,
  info,
}) => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="px-8 py-8 mx-auto max-w-7xl">
          {title && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold">
                Selamat datang,{" "}
                <span className="text-gray-900">{user?.name || user?.email}</span>
              </h1>
            </div>
          )}
          {info && (
            <div className="mb-6 border rounded bg-green-50 border-green-200">
              <div className="px-4 py-3 text-green-800 text-sm">{info}</div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
