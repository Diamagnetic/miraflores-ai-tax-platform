import React from 'react';
import { usePlatformStore } from '@/store/usePlatformStore';
import { UserRoleType } from '@/types';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  UserCheck,
  ShieldCheck,
  User,
  Building2,
  AlertCircle,
  Briefcase,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    setRole,
    returns,
    selectedReturnId,
    selectReturn,
  } = usePlatformStore();

  const activeReturn = returns.find((r) => r.id === selectedReturnId);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'personal_return') {
      setRole('individual_client', true);
    } else {
      setRole(value as UserRoleType, false);
    }
  };

  const currentRoleValue = currentUser.isPersonalReturnView
    ? 'personal_return'
    : currentUser.role;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Left: Brand & Return Context */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-bold tracking-tight text-foreground">
            <div className="flex h-7 w-7 items-center justify-center bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-base tracking-tight font-semibold">MiraFlores AI</span>
          </div>

          <div className="hidden md:flex items-center gap-2 border-l border-border pl-4 text-xs">
            <span className="text-muted-foreground font-medium">Active Return:</span>
            {currentUser.role === 'individual_client' ? (
              <Badge variant="outline" className="font-mono gap-1.5 py-0.5">
                <User className="h-3 w-3 text-primary" />
                {currentUser.name} (Form 1040)
              </Badge>
            ) : (
              <select
                aria-label="Select active tax return"
                value={selectedReturnId || ''}
                onChange={(e) => selectReturn(e.target.value)}
                className="h-8 bg-card border border-border px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {returns.map((ret) => (
                  <option key={ret.id} value={ret.id}>
                    {ret.taxpayerName} ({ret.returnType} - {ret.taxYear}) — Score: {ret.triageScore}
                  </option>
                ))}
              </select>
            )}

            {activeReturn && (
              <Badge
                variant={activeReturn.isBlocked ? 'destructive' : 'secondary'}
                className="text-[11px] gap-1 font-normal py-0.5"
              >
                {activeReturn.isBlocked && <AlertCircle className="h-3 w-3" />}
                {activeReturn.isBlocked
                  ? `Blocked: ${activeReturn.blockerReason || 'Action Required'}`
                  : `Stage: ${activeReturn.status}`}
              </Badge>
            )}
          </div>
        </div>

        {/* Right: Role Switcher & Master Reset */}
        <div className="flex items-center gap-3">
          {/* Role Indicator & Quick Switcher */}
          <div className="flex items-center gap-2 border border-border bg-card p-1">
            <div className="flex items-center gap-1.5 pl-2 pr-1 text-xs font-medium text-foreground">
              {currentUser.role === 'tax_reviewer' ? (
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : currentUser.role === 'tax_preparer' ? (
                <Briefcase className="h-3.5 w-3.5 text-primary" />
              ) : currentUser.isPersonalReturnView ? (
                <Building2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              ) : (
                <UserCheck className="h-3.5 w-3.5 text-primary" />
              )}
              <span className="hidden sm:inline">Active Persona:</span>
            </div>

            <select
              aria-label="Switch active persona role"
              value={currentRoleValue}
              onChange={handleRoleChange}
              className="h-7 bg-muted/50 border-0 px-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-0 cursor-pointer"
            >
              <option value="tax_preparer">Sam Wilson (Tax Preparer)</option>
              <option value="tax_reviewer">Steve Rogers (Senior Reviewer)</option>
              <option value="individual_client">Tony Stark (Client Portal)</option>
              <option value="personal_return">Bruce Banner (Firm Personal 1040)</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
