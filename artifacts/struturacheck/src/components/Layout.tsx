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
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="relative flex-shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border z-20"
        data-testid="sidebar"
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-sidebar-border overflow-hidden">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-primary-foreground" />
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
                  <span className="font-bold text-sm text-foreground tracking-tight whitespace-nowrap">
                    VisionBuild
                  </span>
                  <p className="text-[10px] text-muted-foreground whitespace-nowrap">Defect Detection</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = location === href || (href !== "/" && location.startsWith(href));
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ x: collapsed ? 0 : 2 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 group relative ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                  data-testid={`nav-${label.toLowerCase()}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-primary"
                    />
                  )}
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
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
                    <div className="absolute left-full ml-3 px-2 py-1 bg-popover border border-border rounded-md text-xs text-popover-foreground shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                      {label}
                    </div>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="px-2 pb-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors text-sm"
            data-testid="sidebar-collapse-toggle"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="flex-shrink-0 flex items-center justify-between h-16 px-6 bg-background border-b border-border z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-base font-semibold text-foreground tracking-tight" data-testid="page-title">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative" data-testid="notifications-bell">
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[9px] bg-destructive text-destructive-foreground border-0">
                3
              </Badge>
            </Button>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors"
                  data-testid="user-profile-trigger"
                >
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-foreground leading-none">{user?.name || "User"}</p>
                    <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{user?.role || "Structural Engineer"}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" data-testid="user-dropdown">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-semibold text-sm">{user?.name || "User"}</p>
                    <p className="text-xs text-muted-foreground font-normal">{user?.email}</p>
                    <p className="text-xs text-primary font-normal mt-0.5">{user?.role || "Structural Engineer"}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild data-testid="account-settings-link">
                  <Link href="/settings">
                    <User className="w-4 h-4 mr-2" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
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
        <main className="flex-1 overflow-y-auto bg-background">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
