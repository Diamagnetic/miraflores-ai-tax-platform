import React, { useState } from 'react';
import { AffordanceState } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  ShieldCheck,
  Edit3,
  Lock,
  AlertTriangle,
  HelpCircle,
  X,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface AffordanceLegendProps {
  onFilterByState?: (state: AffordanceState | 'all') => void;
  selectedState?: AffordanceState | 'all';
  className?: string;
}

interface AffordanceMeta {
  state: AffordanceState;
  name: string;
  badgeLabel: string;
  colorTheme: string;
  icon: React.ElementType;
  description: string;
  cpaAction: string;
  defensibility: string;
}

export const AFFORDANCE_DEFINITIONS: AffordanceMeta[] = [
  {
    state: 'ai_extracted',
    name: 'AI Extracted',
    badgeLabel: '98% CONFIDENCE',
    colorTheme: 'bg-purple-100/90 text-purple-950 border-purple-300 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-700',
    icon: Sparkles,
    description: 'Extracted automatically from source OCR documents (W-2, 1099-NEC, 1099-DIV, Receipts).',
    cpaAction: 'Click to inspect vector bounding box in source PDF. Click "Verify" to lock.',
    defensibility: 'Full source document coordinate link with bounding box highlight.',
  },
  {
    state: 'verified',
    name: 'Verified & Locked',
    badgeLabel: 'LOCKED',
    colorTheme: 'bg-emerald-100/90 text-emerald-950 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700',
    icon: ShieldCheck,
    description: 'Reviewed and confirmed by CPA preparer or senior reviewer against source workpapers.',
    cpaAction: 'Read-only locked state. Requires explicit manual edit modal with audit note to modify.',
    defensibility: 'Signed off with CPA timestamp and audit verification log.',
  },
  {
    state: 'user_edited',
    name: 'Manual Override',
    badgeLabel: 'EDITED',
    colorTheme: 'bg-amber-100/95 text-amber-950 border-amber-400 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700',
    icon: Edit3,
    description: 'Manually entered or adjusted by preparer/reviewer with required audit trail reason.',
    cpaAction: 'Hover or click to inspect audit trail: prior value, CPA author, timestamp, and justification.',
    defensibility: 'Mandatory audit note recorded for Circular 230 compliance.',
  },
  {
    state: 'calculated_locked',
    name: 'Calculated / IRS Formula',
    badgeLabel: 'FORMULA',
    colorTheme: 'bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800/90 dark:text-slate-200 dark:border-slate-700',
    icon: Lock,
    description: 'Computed automatically from IRS schedule formulas and statutory tax rate tables.',
    cpaAction: 'Click to inspect calculation breakdown (inputs, intermediate math, and schedule dependencies).',
    defensibility: 'Strict statutory formula verification; cannot be manually overwritten.',
  },
  {
    state: 'requires_approval',
    name: 'Discrepancy / Needs QA',
    badgeLabel: 'DISCREPANCY',
    colorTheme: 'bg-rose-100/90 text-rose-950 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-700 animate-pulse',
    icon: AlertTriangle,
    description: 'Variance detected between multiple documents or values requiring partner review.',
    cpaAction: 'Open inspection drawer to compare competing source figures or request client clarification.',
    defensibility: 'Flagged for explicit partner sign-off before electronic filing.',
  },
];

export const AffordanceLegend: React.FC<AffordanceLegendProps> = ({
  onFilterByState,
  selectedState = 'all',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeDef, setActiveDef] = useState<AffordanceMeta>(AFFORDANCE_DEFINITIONS[0]);

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-7 px-2.5 text-xs font-semibold gap-1.5 border shadow-2xs transition-all ${
          isOpen
            ? 'bg-primary/10 text-primary border-primary/40'
            : 'text-muted-foreground hover:text-foreground border-border hover:bg-muted/40'
        }`}
        title="View 5-State Return Field Affordance System"
      >
        <Info className="h-3.5 w-3.5 text-primary" />
        <span>Affordance Guide</span>
        <Badge variant="outline" className="font-mono text-[9px] py-0 px-1 bg-card border-border ml-0.5">
          5 States
        </Badge>
      </Button>

      {/* Popover Card / Modal */}
      {isOpen && (
        <div className="absolute right-0 top-9 z-40 w-80 sm:w-96 bg-card border border-border shadow-xl p-4 space-y-3.5 text-xs">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-primary" />
              <span className="font-bold text-foreground">Return Field Affordance Guide</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Every cell on Form 1040 and Schedules follows a strict 5-state color contract to ensure instant visual clarity on verification status.
          </p>

          {/* Interactive State Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-muted-foreground block">
              Click state to inspect standards:
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {AFFORDANCE_DEFINITIONS.map((def) => {
                const Icon = def.icon;
                const isCurrent = activeDef.state === def.state;
                return (
                  <button
                    key={def.state}
                    type="button"
                    onClick={() => {
                      setActiveDef(def);
                      onFilterByState?.(def.state);
                    }}
                    className={`flex items-center justify-between p-2 border text-left transition-all ${
                      isCurrent
                        ? `${def.colorTheme} font-semibold ring-1 ring-primary/40`
                        : 'border-border bg-muted/20 hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-xs">{def.name}</span>
                    </div>
                    <Badge variant="outline" className="font-mono text-[9px] py-0 bg-background/80">
                      {def.badgeLabel}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected State Detail Box */}
          <div className="p-3 bg-muted/30 border border-border space-y-2 text-[11px]">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span>{activeDef.name} Protocol</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {activeDef.description}
            </p>
            <div className="pt-1 space-y-1 border-t border-border/60 text-[10px]">
              <p>
                <strong>CPA Action:</strong> {activeDef.cpaAction}
              </p>
              <p>
                <strong>IRS Defensibility:</strong> {activeDef.defensibility}
              </p>
            </div>
          </div>

          {/* Quick Filter Reset */}
          {onFilterByState && selectedState !== 'all' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFilterByState('all')}
              className="w-full h-6 text-[10px] text-muted-foreground hover:text-foreground"
            >
              Reset table filter to Show All
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
