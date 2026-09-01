import React from 'react';
import { usePlatformStore, SAVED_PERSONAS, PersonaAccount } from '@/store/usePlatformStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Sparkles,
  ChevronRight,
  Lock,
} from 'lucide-react';

interface SavedLoginsScreenProps {
  className?: string;
}

export const SavedLoginsScreen: React.FC<SavedLoginsScreenProps> = ({
  className = '',
}) => {
  const { login } = usePlatformStore();

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between font-sans ${className}`}>
      {/* Top Corporate Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background shadow-2xs">
        <div className="flex h-14 items-center px-4 sm:px-6">
          <div className="flex items-center gap-2 font-bold tracking-tight text-foreground">
            <div className="flex h-7 w-7 items-center justify-center bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-base tracking-tight font-semibold">MiraFlores AI</span>
          </div>
        </div>
      </header>

      {/* Main Single Sign-On Account Chooser Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md border border-border bg-card shadow-lg p-0 overflow-hidden">
          <CardHeader className="text-center pt-8 pb-4 px-6 space-y-1.5">
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              Choose an account
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              to continue to MiraFlores Tax Intelligence
            </CardDescription>
          </CardHeader>

          <CardContent className="px-0 pb-4 pt-2">
            <div className="divide-y divide-border border-y border-border">
              {SAVED_PERSONAS.map((persona: PersonaAccount) => (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => login(persona.id)}
                  className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-muted/70 transition-colors cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`h-10 w-10 flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${persona.avatarColor}`}
                    >
                      {persona.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {persona.name}
                        </p>
                        <span className="text-[10px] font-mono px-1.5 py-0 bg-muted border border-border text-muted-foreground shrink-0 font-medium">
                          {persona.badgeLabel}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                        {persona.email}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </button>
              ))}
            </div>

            <div className="px-6 pt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground font-mono">
              <Lock className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <span>SOC-2 Type II Certified • 256-Bit Encrypted</span>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground">
        <p className="text-[11px]">
          MiraFlores AI Tax Intelligence Platform • Single Sign-On
        </p>
      </footer>
    </div>
  );
};
