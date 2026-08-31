import React, { useState, useRef, useEffect } from 'react';
import { usePlatformStore } from '@/store/usePlatformStore';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ChevronDown,
  ShieldCheck,
  Briefcase,
  UserCheck,
  Building2,
  User,
  LogOut,
  Settings,
  HelpCircle,
} from 'lucide-react';

interface UserAccountMenuProps {
  className?: string;
}

export const UserAccountMenu: React.FC<UserAccountMenuProps> = ({
  className = '',
}) => {
  const {
    currentUser,
    logout,
    togglePersonalReturnView,
  } = usePlatformStore();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside or Esc key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const isStaff = currentUser.role === 'tax_preparer' || currentUser.role === 'tax_reviewer' || currentUser.isPersonalReturnView;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getRoleIcon = () => {
    if (currentUser.isPersonalReturnView) {
      return <Building2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />;
    }
    if (currentUser.role === 'tax_reviewer') {
      return <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />;
    }
    if (currentUser.role === 'tax_preparer') {
      return <Briefcase className="h-3.5 w-3.5 text-primary" />;
    }
    return <UserCheck className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />;
  };

  const getRoleLabel = () => {
    if (currentUser.isPersonalReturnView) {
      return 'Staff Personal Return';
    }
    if (currentUser.role === 'tax_reviewer') {
      return 'Senior Reviewer & Partner';
    }
    if (currentUser.role === 'tax_preparer') {
      return 'Lead Tax Preparer';
    }
    return 'Individual Taxpayer';
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      {/* Navbar Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-2.5 py-1.5 border transition-colors cursor-pointer text-left ${
          isOpen
            ? 'bg-muted border-primary/50 text-foreground ring-1 ring-primary/20'
            : 'bg-card border-border hover:bg-muted/70 hover:border-border/80 text-foreground'
        } shadow-2xs`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar Initials */}
        <div className="flex h-7 w-7 items-center justify-center bg-primary text-primary-foreground font-bold text-xs shrink-0">
          {getInitials(currentUser.name)}
        </div>

        {/* User Info */}
        <div className="hidden sm:block text-left">
          <div className="text-xs font-bold leading-none text-foreground flex items-center gap-1">
            <span>{currentUser.name}</span>
            {currentUser.isPersonalReturnView && (
              <Badge variant="outline" className="text-[9px] px-1 py-0 border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-mono">
                Personal
              </Badge>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground font-mono block mt-0.5">
            {currentUser.isPersonalReturnView
              ? 'Form 1040 Personal'
              : currentUser.role === 'tax_reviewer'
              ? 'Reviewer'
              : currentUser.role === 'tax_preparer'
              ? 'Preparer'
              : 'Client'}
          </span>
        </div>

        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </button>

      {/* Dropdown Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-72 origin-top-right border border-border bg-card shadow-xl z-50 text-xs font-sans divide-y divide-border animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Header Profile Section */}
          <div className="p-3.5 bg-muted/30">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-primary text-primary-foreground font-bold text-sm shrink-0 shadow-2xs">
                {getInitials(currentUser.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground truncate text-sm">
                  {currentUser.name}
                </p>
                <p className="text-[11px] text-muted-foreground font-mono truncate">
                  {currentUser.email}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5 gap-1 border-border bg-background">
                    {getRoleIcon()}
                    <span>{getRoleLabel()}</span>
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-1.5 space-y-0.5">
            {/* Staff Personal Return Mode Toggle Option */}
            {isStaff && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    togglePersonalReturnView();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-foreground hover:bg-muted transition-colors cursor-pointer text-left font-medium rounded-xs"
                >
                  {currentUser.isPersonalReturnView ? (
                    <>
                      <Briefcase className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>Return to Firm Workspace</span>
                    </>
                  ) : (
                    <>
                      <User className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>Switch to My Personal Return</span>
                    </>
                  )}
                </button>
                <Separator className="my-1" />
              </>
            )}

            <button
              type="button"
              onClick={() => {
                alert('MiraFlores AI Firm Settings & Security Preferences');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer text-left"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Workspace Settings</span>
            </button>

            <button
              type="button"
              onClick={() => {
                alert('MiraFlores AI Help Center & Regulatory Tax Guidance');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer text-left"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Help & Documentation</span>
            </button>

            <Separator className="my-1" />

            <button
              type="button"
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer font-medium text-left"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out to Saved Logins</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
