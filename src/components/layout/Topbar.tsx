import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu, Bell, Sun, Moon, Monitor, ChevronDown, LogOut,
  Settings, User, ChevronRight, Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, useTheme, useNotifications } from '@/hooks';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { setColorMode, setThemeVariant } from '@/store/slices/themeSlice';
import { toggleSidebar } from '@/store/slices/themeSlice';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { MODULE_CONFIG, THEME_OPTIONS } from '@/config/modules.config';
import type { ColorMode } from '@/types';

// ─── Breadcrumb ─────────────────────────────────────────────────────────────────
function Breadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  const crumbs = segments.map((seg, idx) => {
    const path = '/' + segments.slice(0, idx + 1).join('/');
    const module = MODULE_CONFIG.find((m) => m.basePath === path);
    const label = module?.label ?? seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
    return { label, path };
  });

  if (crumbs.length === 0) return null;

  return (
    <nav className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
      <Link to="/dashboard" className="hover:text-foreground transition-colors">
        Home
      </Link>
      {crumbs.map((crumb, i) => (
        <React.Fragment key={crumb.path}>
          <ChevronRight className="h-3 w-3" />
          {i === crumbs.length - 1 ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// ─── Theme Menu ─────────────────────────────────────────────────────────────────
function ThemeMenu() {
  const dispatch = useAppDispatch();
  const { colorMode, variant } = useTheme();
  const [open, setOpen] = useState(false);

  const COLOR_MODES: { value: ColorMode; icon: React.ReactNode; label: string }[] = [
    { value: 'light', icon: <Sun className="h-4 w-4" />, label: 'Light' },
    { value: 'dark', icon: <Moon className="h-4 w-4" />, label: 'Dark' },
    { value: 'system', icon: <Monitor className="h-4 w-4" />, label: 'System' },
  ];

  const currentIcon = COLOR_MODES.find((m) => m.value === colorMode)?.icon ?? <Sun className="h-4 w-4" />;

  return (
    <div className="relative">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setOpen(!open)}
        className="text-muted-foreground"
      >
        {currentIcon}
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-popover border border-border rounded-xl shadow-elevated z-50 p-2 animate-fade-in">
          <p className="text-xs font-semibold text-muted-foreground px-2 py-1.5 uppercase tracking-wide">
            Color Mode
          </p>
          {COLOR_MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => { dispatch(setColorMode(m.value)); setOpen(false); }}
              className={cn(
                'flex items-center gap-2.5 w-full px-2 py-2 rounded-lg text-sm transition-colors',
                colorMode === m.value
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              {m.icon}
              {m.label}
              {colorMode === m.value && <span className="ml-auto text-xs">✓</span>}
            </button>
          ))}
          <div className="my-2 border-t border-border" />
          <p className="text-xs font-semibold text-muted-foreground px-2 py-1.5 uppercase tracking-wide">
            Accent Color
          </p>
          <div className="flex items-center gap-2 px-2 py-1.5 flex-wrap">
            {THEME_OPTIONS.map((t) => (
              <button
                key={t.value}
                onClick={() => { dispatch(setThemeVariant(t.value)); setOpen(false); }}
                title={t.label}
                className={cn(
                  'h-6 w-6 rounded-full border-2 transition-transform hover:scale-110',
                  variant === t.value ? 'border-foreground scale-110' : 'border-transparent'
                )}
                style={{ backgroundColor: t.color }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Notification Bell ──────────────────────────────────────────────────────────
function NotificationBell() {
  const { unreadCount } = useNotifications();
  return (
    <Link to="/notifications">
      <Button size="icon" variant="ghost" className="text-muted-foreground relative">
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>
    </Link>
  );
}

// ─── User Menu ──────────────────────────────────────────────────────────────────
function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors"
      >
        <Avatar name={user.name} src={user.avatar} size="sm" />
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium leading-none">{user.name}</p>
          <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{user.role}</p>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-52 bg-popover border border-border rounded-xl shadow-elevated z-50 p-2 animate-fade-in">
            <div className="px-2 py-2 mb-1">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <div className="border-t border-border my-1" />
            <Link
              to="/settings/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
            >
              <User className="h-4 w-4 text-muted-foreground" /> Profile
            </Link>
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
            >
              <Settings className="h-4 w-4 text-muted-foreground" /> Settings
            </Link>
            <div className="border-t border-border my-1" />
            <button
              onClick={() => { logout(); setOpen(false); }}
              className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm w-full text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Topbar ─────────────────────────────────────────────────────────────────────
interface TopbarProps {
  onMobileMenuOpen: () => void;
}

export function Topbar({ onMobileMenuOpen }: TopbarProps) {
  const dispatch = useAppDispatch();

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-4 gap-3 flex-shrink-0 sticky top-0 z-30">
      {/* Mobile hamburger */}
      <Button
        size="icon"
        variant="ghost"
        className="lg:hidden text-muted-foreground"
        onClick={onMobileMenuOpen}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Desktop collapse toggle */}
      <Button
        size="icon"
        variant="ghost"
        className="hidden lg:flex text-muted-foreground"
        onClick={() => dispatch(toggleSidebar())}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Breadcrumb */}
      <div className="flex-1 min-w-0">
        <Breadcrumb />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button size="icon" variant="ghost" className="text-muted-foreground">
          <Search className="h-4 w-4" />
        </Button>
        <ThemeMenu />
        <NotificationBell />
        <div className="w-px h-5 bg-border mx-1" />
        <UserMenu />
      </div>
    </header>
  );
}
