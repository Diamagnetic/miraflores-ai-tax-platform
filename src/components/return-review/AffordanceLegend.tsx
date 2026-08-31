import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AffordanceState } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  ShieldCheck,
  Edit3,
  Lock,
  AlertTriangle,
  X,
  CheckCircle2,
  Info,
  Layers,
  ArrowRight,
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
  exampleField: string;
}

export const AFFORDANCE_DEFINITIONS: AffordanceMeta[] = [
  {
    state: 'ai_extracted',
    name: 'AI Extracted',
    badgeLabel: '98% CONFIDENCE',
    colorTheme: 'bg-purple-100/90 text-purple-950 border-purple-300 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-700',
    icon: Sparkles,
    description: 'Extracted automatically from ingested source documents (Form W-2, 1099-NEC, 1099-DIV, 1099-B, or receipts) with bounding box geometry.',
    cpaAction: 'Click affordance badge to open AI Explainability and source vector bounding box in split view. Click "Verify" to lock.',
    defensibility: 'Direct coordinate-level traceability back to source PDF workpapers.',
    exampleField: 'Line 1a Gross Receipts ($142,500)',
  },
  {
    state: 'verified',
    name: 'Verified & Locked',
    badgeLabel: 'LOCKED',
    colorTheme: 'bg-emerald-100/90 text-emerald-950 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700',
    icon: ShieldCheck,
    description: 'Reviewed and confirmed by CPA preparer or senior reviewer against source workpapers. Locked against accidental alteration.',
    cpaAction: 'Read-only locked state. Modifying requires opening the explicit manual value override modal with a mandatory audit justification note.',
    defensibility: 'CPA signature timestamp and verification audit trail recorded for Circular 230 compliance.',
    exampleField: 'Line 3a Qualified Dividends ($290,000)',
  },
  {
    state: 'user_edited',
    name: 'Manual Override',
    badgeLabel: 'EDITED',
    colorTheme: 'bg-amber-100/95 text-amber-950 border-amber-400 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700',
    icon: Edit3,
    description: 'Manually entered or adjusted by preparer/reviewer with required regulatory audit trail justification.',
    cpaAction: 'Hover or click to inspect audit trail: prior value, CPA author, timestamp, and justification.',
    defensibility: 'Mandatory audit note (e.g., "Taxpayer oral confirmation", "K-1 reconciliation") preserved in audit log.',
    exampleField: 'Schedule C Line 24b Meal Substantiation ($12,400)',
  },
  {
    state: 'calculated_locked',
    name: 'Calculated / IRS Formula',
    badgeLabel: 'FORMULA',
    colorTheme: 'bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800/90 dark:text-slate-200 dark:border-slate-700',
    icon: Lock,
    description: 'Computed automatically from IRS statutory tax rate brackets, phase-outs, and mathematical schedule roll-ups.',
    cpaAction: 'Click to inspect calculation breakdown (formula inputs, intermediate math, and schedule dependencies).',
    defensibility: 'Strict statutory formula verification; cannot be manually overwritten.',
    exampleField: 'Line 24 Total Tax Liability ($42,100)',
  },
  {
    state: 'requires_approval',
    name: 'Discrepancy / Needs QA',
    badgeLabel: 'DISCREPANCY',
    colorTheme: 'bg-rose-100/90 text-rose-950 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-700 animate-pulse',
    icon: AlertTriangle,
    description: 'Variance detected between competing documents, missing required workpapers, or figures requiring partner sign-off.',
    cpaAction: 'Open inspection drawer to compare competing source figures or dispatch pre-drafted client inquiry.',
    defensibility: 'Flagged for partner review before electronic filing transmission.',
    exampleField: 'Line 1 Nonemployee Compensation (Missing 1099-NEC)',
  },
];

export const AffordanceLegend: React.FC<AffordanceLegendProps> = ({
  onFilterByState,
  selectedState = 'all',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeDef, setActiveDef] = useState<AffordanceMeta>(AFFORDANCE_DEFINITIONS[0]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const modalContent = isOpen && typeof document !== 'undefined' ? (
    createPortal(
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
        {/* Backdrop click to close */}
        <div
          className="fixed inset-0"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />

        {/* Centered Modal Card */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="affordance-modal-title"
          className="relative z-10 w-full max-w-2xl bg-card border border-border shadow-2xl p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 text-primary">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h3 id="affordance-modal-title" className="font-bold text-sm text-foreground">
                  Return Field Affordance System
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Universal 5-state visual language for tax figure verification & defensibility
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Every dollar figure on Form 1040 and attached schedules follows a strict 5-state semantic contract. Click any state below to inspect its workflow protocol, CPA action guidelines, and filter the active workbench table.
          </p>

          {/* 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 pt-1">
            {/* Left: State Selector List (2 cols on desktop) */}
            <div className="md:col-span-2 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider block">
                Select Affordance State:
              </span>
              <div className="space-y-1.5">
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
                      className={`w-full flex items-center justify-between p-2.5 border text-left transition-all ${
                        isCurrent
                          ? `${def.colorTheme} font-bold ring-2 ring-primary/50 shadow-2xs`
                          : 'border-border bg-muted/20 hover:bg-muted/60 text-foreground'
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

              {/* Reset Filter Button */}
              {onFilterByState && selectedState !== 'all' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFilterByState('all')}
                  className="w-full h-7 text-[10px] font-semibold text-muted-foreground hover:text-foreground mt-2"
                >
                  Reset Table to Show All States
                </Button>
              )}
            </div>

            {/* Right: Selected State Deep Protocol (3 cols on desktop) */}
            <div className="md:col-span-3 p-4 bg-muted/20 border border-border space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-border/80 pb-2">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-xs">{activeDef.name} Protocol</span>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] uppercase">
                    {activeDef.state.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Description & Source:
                  </span>
                  <p className="text-[11px] text-foreground/90 leading-relaxed">
                    {activeDef.description}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    CPA Review Action:
                  </span>
                  <p className="text-[11px] text-foreground/90 leading-relaxed">
                    {activeDef.cpaAction}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Regulatory Defensibility (Circular 230):
                  </span>
                  <p className="text-[11px] text-foreground/90 leading-relaxed font-sans">
                    {activeDef.defensibility}
                  </p>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-2.5 bg-background border border-border/80 text-[11px] flex items-center justify-between mt-2">
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">
                    Example Return Line:
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {activeDef.exampleField}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-primary font-mono">
                  <span>Filtered in Table</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-between border-t border-border text-[11px] text-muted-foreground">
            <span>Press <kbd className="px-1.5 py-0.5 bg-muted border border-border text-[10px] font-mono">Esc</kbd> to close</span>
            <Button
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-7 px-4 text-xs font-semibold"
            >
              Done
            </Button>
          </div>
        </div>
      </div>,
      document.body
    )
  ) : null;

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={`h-7 px-2.5 text-xs font-semibold gap-1.5 border shadow-2xs transition-all ${
          isOpen
            ? 'bg-primary/10 text-primary border-primary/40'
            : 'text-muted-foreground hover:text-foreground border-border hover:bg-muted/40'
        }`}
        title="View 5-State Return Field Affordance System in centered modal"
      >
        <Info className="h-3.5 w-3.5 text-primary" />
        <span>Affordance Guide</span>
        <Badge variant="outline" className="font-mono text-[9px] py-0 px-1 bg-card border-border ml-0.5">
          5 States
        </Badge>
      </Button>

      {/* Portaled Centered Modal Overlay */}
      {modalContent}
    </div>
  );
};
