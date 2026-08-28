import React from 'react';
import { usePlatformStore } from '@/store/usePlatformStore';
import { UserRoleType } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  UserCheck,
  ShieldCheck,
  User,
  RotateCcw,
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
    resetToBaseline,
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
                value={selectedReturnId || ''}
                onChange={(e) => selectReturn(e.target.value)}
                className="h-7 bg-background border border-input px-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {returns.map((ret) => (
                  <option key={ret.id} value={ret.id}>
                    {ret.taxpayerName} ({ret.returnType}) — {ret.status}
                  </option>
                ))}
              </select>
            )}

            {activeReturn && (
              <Badge
                variant={activeReturn.isBlocked ? 'destructive' : 'verified'}
                className="gap-1 text-[11px] py-0.5"
              >
                {activeReturn.isBlocked ? (
                  <>
                    <AlertCircle className="h-3 w-3" />
                    Blocked
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-3 w-3" />
                    {activeReturn.status}
                  </>
                )}
              </Badge>
            )}
          </div>
        </div>

        {/* Right: Role Switcher & Reset Button */}
        <div className="flex items-center gap-3">
          {/* Ephemeral Reset */}
          <Button
            variant="outline"
            size="sm"
            onClick={resetToBaseline}
            title="Reset in-memory state to pristine baseline"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset Demo</span>
          </Button>

          {/* Role Switcher */}
          <div className="flex items-center gap-2 bg-muted/60 border border-input p-1">
            <div className="flex items-center gap-1.5 px-2 text-xs font-medium text-foreground">
              {currentUser.isPersonalReturnView ? (
                <Building2 className="h-3.5 w-3.5 text-primary" />
              ) : currentUser.role === 'tax_reviewer' ? (
                <UserCheck className="h-3.5 w-3.5 text-primary" />
              ) : currentUser.role === 'tax_preparer' ? (
                <Briefcase className="h-3.5 w-3.5 text-primary" />
              ) : (
                <User className="h-3.5 w-3.5 text-primary" />
              )}
              <span className="hidden lg:inline text-muted-foreground">Role:</span>
            </div>

            <select
              value={currentRoleValue}
              onChange={handleRoleChange}
              className="h-7 bg-background border border-input px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="tax_preparer">Preparer (Sam Wilson CPA)</option>
              <option value="tax_reviewer">Reviewer (Steve Rogers)</option>
              <option value="individual_client">Client (Tony Stark)</option>
              <option value="personal_return">Personal Return (Bruce Banner)</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
