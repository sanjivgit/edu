import React, { useState, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UserPlus,
  UserRound,
  School,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  BookMarked,
  PenLine,
  GraduationCap,
  Layers,
  CreditCard,
  FileText,
  Bus,
  Bell,
  NotebookPen,
  Palmtree,
  MessageSquare,
  BellRing,
  Video,
  PlayCircle,
  Image,
  BarChart3,
  Shield,
  ScrollText,
  Settings,
  Package,
  Building2,
  ChevronDown,
  ChevronRight,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, useTheme } from "@/hooks";
import {
  buildNavItems,
  NAV_GROUPS,
  NAV_GROUP_MAP,
} from "@/config/modules.config";
import type { NavItem } from "@/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  UserPlus,
  UserRound,
  School,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  BookMarked,
  PenLine,
  GraduationCap,
  Layers,
  CreditCard,
  FileText,
  Bus,
  Bell,
  NotebookPen,
  Palmtree,
  MessageSquare,
  BellRing,
  Video,
  PlayCircle,
  Image,
  BarChart3,
  Shield,
  ScrollText,
  Settings,
  Package,
  Building2,
};

function NavItemComponent({
  item,
  collapsed,
}: {
  item: NavItem;
  collapsed: boolean;
}) {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
  const isActive = location.pathname.startsWith(item.path);
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
            isActive
              ? "bg-sidebar-accent text-white"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          )}
        >
          <Icon className="h-[18px] w-[18px] flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{item.label}</span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 flex-shrink-0 opacity-60" />
              ) : (
                <ChevronRight className="h-4 w-4 flex-shrink-0 opacity-60" />
              )}
            </>
          )}
        </button>
        {isExpanded && !collapsed && (
          <div className="ml-7 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
            {item.children!.map((child) => (
              <NavLink
                key={child.id}
                to={child.path}
                className={({ isActive: a }) =>
                  cn(
                    "flex items-center gap-2 px-2 py-2 rounded-md text-xs font-medium transition-all",
                    a
                      ? "text-white bg-sidebar-accent"
                      : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
                  )
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      title={collapsed ? item.label : undefined}
      className={({ isActive: a }) =>
        cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative",
          a
            ? "bg-sidebar-accent text-white shadow-sm"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        )
      }
    >
      <Icon className="h-[18px] w-[18px] flex-shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge !== undefined && (
            <span className="h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {item.badge}
            </span>
          )}
        </>
      )}
      {collapsed && (
        <div className="absolute left-full ml-2 z-50 hidden group-hover:flex items-center px-2.5 py-1.5 bg-popover text-popover-foreground text-xs font-medium rounded-md shadow-elevated border border-border whitespace-nowrap">
          {item.label}
        </div>
      )}
    </NavLink>
  );
}

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const { user } = useAuth();
  const { sidebarCollapsed, branding } = useTheme();

  const navItems = useMemo(
    () => (user ? buildNavItems(user.role) : []),
    [user]
  );

  const groupedItems = useMemo(() => {
    const groups: Record<string, NavItem[]> = {};
    NAV_GROUPS.forEach((g) => {
      groups[g.id] = [];
    });
    navItems.forEach((item) => {
      const groupId = NAV_GROUP_MAP[item.id] ?? "overview";
      if (!groups[groupId]) groups[groupId] = [];
      groups[groupId].push(item);
    });
    return groups;
  }, [navItems]);

  const sidebarContent = (
    <div
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300",
        sidebarCollapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border flex-shrink-0">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Zap className="h-4.5 w-4.5 text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <p className="font-display font-bold text-sm text-sidebar-foreground truncate">
              {branding?.instituteName ?? "EduCore ERP"}
            </p>
            <p className="text-[10px] text-sidebar-foreground/40 uppercase tracking-widest">
              School Management
            </p>
          </div>
        )}
        {mobileOpen && (
          <button
            onClick={onMobileClose}
            className="ml-auto text-sidebar-foreground/50 hover:text-sidebar-foreground lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2 space-y-5">
        {NAV_GROUPS.map((group) => {
          const items = groupedItems[group.id] ?? [];
          if (items.length === 0) return null;
          return (
            <div key={group.id}>
              {!sidebarCollapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/30">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {items.map((item) => (
                  <NavItemComponent
                    key={item.id}
                    item={item}
                    collapsed={sidebarCollapsed}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* User footer */}
      {user && !sidebarCollapsed && (
        <div className="px-3 py-4 border-t border-sidebar-border flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-sidebar-accent/30">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user.name}
              </p>
              <p className="text-[10px] text-sidebar-foreground/40 capitalize">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block flex-shrink-0 relative z-30">
        {sidebarContent}
      </div>
      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onMobileClose}
          />
          <div className="relative z-10 animate-slide-in-left">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
