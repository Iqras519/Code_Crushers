import { useState, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Upload,
  BarChart3,
  ShieldAlert,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  LogOut,
  User,
  Menu,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/recommendations", label: "Recommendations", icon: ShieldAlert },
  { href: "/settings", label: "Settings", icon: Settings },
];

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/upload": "Image Analysis",
  "/analytics": "Analytics",
  "/recommendations": "Recommendations",
  "/settings": "Settings",
};

export default function Layout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "SC";

  const pageTitle = PAGE_TITLES[location] || "VisionBuild";

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <div className="flex h-screen bg-[#0F172A] overflow-hidden text-slate-100 engineering-grid">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="relative flex-shrink-0 flex flex-col bg-slate-950/80 backdrop-blur-md border-r border-slate-800/60 z-20"
        data-testid="sidebar"
      >
        {/* Logo / Brand Header */}
        <div className="flex items-center h-16 px-4 border-b border-slate-800/60 overflow-hidden">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/10">
              <ShieldAlert className="w-4.5 h-4.5 text-white" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <span className="font-bold text-sm tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                    VisionBuild AI
                  </span>
                  <p className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">Defect Platform</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-6 space-y-1.5 px-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = location === href || (href !== "/" && location.startsWith(href));
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ x: collapsed ? 0 : 4 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 group relative ${
                    isActive
                      ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent"
                  }`}
                  data-testid={`nav-${label.toLowerCase()}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-blue-500"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200"}`} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        className="text-sm font-medium whitespace-nowrap"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {collapsed && (
                    <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                      {label}
                    </div>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="px-3 pb-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 transition-colors text-xs font-semibold border border-transparent hover:border-slate-800/60"
            data-testid="sidebar-collapse-toggle"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Panel</span>
              </>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-900/40">
        {/* Top Navbar */}
        <header className="flex-shrink-0 flex items-center justify-between h-16 px-6 bg-slate-950/40 backdrop-blur-md border-b border-slate-800/60 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-semibold tracking-wider text-slate-300 uppercase" data-testid="page-title">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-xl" data-testid="notifications-bell">
              <Bell className="w-4.5 h-4.5" />
              <Badge className="absolute top-1 right-1 w-4 h-4 p-0 flex items-center justify-center text-[9px] font-bold bg-rose-500 text-white border-0 shadow-lg shadow-rose-500/20">
                3
              </Badge>
            </Button>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-3 px-2 py-1 rounded-xl hover:bg-slate-850/60 transition-colors border border-transparent hover:border-slate-800/40"
                  data-testid="user-profile-trigger"
                >
                  <Avatar className="w-8 h-8 border border-slate-700">
                    <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-cyan-500 text-white text-xs font-bold shadow-inner">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-200 leading-none">{user?.name || "User"}</p>
                    <p className="text-[10px] text-slate-400 font-medium leading-none mt-1">{user?.role || "Structural Engineer"}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-1.5 shadow-2xl" data-testid="user-dropdown">
                <DropdownMenuLabel className="px-2.5 py-2">
                  <div>
                    <p className="font-semibold text-sm text-slate-100">{user?.name || "User"}</p>
                    <p className="text-xs text-slate-400 font-normal mt-0.5">{user?.email}</p>
                    <p className="text-[10px] font-bold text-blue-400 tracking-wider uppercase mt-1">{user?.role || "Structural Engineer"}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800/60" />
                <DropdownMenuItem asChild data-testid="account-settings-link" className="rounded-lg focus:bg-slate-850 focus:text-white transition-colors cursor-pointer p-2 text-xs">
                  <Link href="/settings">
                    <div className="flex items-center w-full">
                      <Settings className="w-4 h-4 mr-2 text-slate-400" />
                      Account Settings
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-800/60" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-rose-400 focus:text-rose-300 focus:bg-rose-500/10 rounded-lg cursor-pointer p-2 text-xs transition-colors"
                  data-testid="logout-button"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-900/20">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
