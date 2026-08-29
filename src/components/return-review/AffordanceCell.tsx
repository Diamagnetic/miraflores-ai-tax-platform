import React from 'react';
import { ReturnField, AffordanceState } from '@/types';
import {
  Sparkles,
  ShieldCheck,
  Edit3,
  Lock,
  AlertTriangle,
} from 'lucide-react';

interface AffordanceCellProps {
  field: ReturnField;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const AffordanceCell: React.FC<AffordanceCellProps> = ({
  field,
  isSelected = false,
  onClick,
  className = '',
}) => {
  const { state, formattedValue, value, aiConfidence, formula, auditHistory } = field;

  const getAffordanceStyles = (cellState: AffordanceState) => {
    switch (cellState) {
      case 'ai_extracted':
        return {
          container:
            'bg-purple-100/90 hover:bg-purple-200/90 text-purple-950 border-purple-300 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 dark:text-purple-200 dark:border-purple-700',
          icon: <Sparkles className="h-3.5 w-3.5 text-purple-700 dark:text-purple-400 shrink-0" />,
          label: 'AI Extracted',
          badge: aiConfidence ? (
            <span className="ml-auto text-[10px] font-mono px-1 py-0.2 bg-purple-200 dark:bg-purple-900/70 text-purple-900 dark:text-purple-200 font-bold select-none">
              {Math.round(aiConfidence > 1 ? aiConfidence : aiConfidence * 100)}%
            </span>
          ) : null,
        };

      case 'verified':
        return {
          container:
            'bg-emerald-100/90 hover:bg-emerald-200/90 text-emerald-950 border-emerald-300 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-700',
          icon: <ShieldCheck className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />,
          label: 'Verified',
          badge: (
            <span className="ml-auto text-[10px] font-mono px-1 py-0.2 bg-emerald-200 dark:bg-emerald-900/70 text-emerald-900 dark:text-emerald-200 font-bold select-none">
              LOCKED
            </span>
          ),
        };

      case 'user_edited':
        return {
          container:
            'bg-amber-100/95 hover:bg-amber-200/90 text-amber-950 border-amber-400 dark:bg-amber-950/60 dark:hover:bg-amber-900/70 dark:text-amber-200 dark:border-amber-700',
          icon: <Edit3 className="h-3.5 w-3.5 text-amber-800 dark:text-amber-400 shrink-0" />,
          label: 'Manual Edit',
          badge: (
            <span
              className="ml-auto text-[10px] font-mono px-1 py-0.2 bg-amber-200 dark:bg-amber-900/70 text-amber-950 dark:text-amber-200 font-bold select-none"
              title={auditHistory && auditHistory.length > 0 ? `Edited by ${auditHistory[0].changedBy}: ${auditHistory[0].reason || 'Manual override'}` : 'Manual override'}
            >
              EDITED
            </span>
          ),
        };

      case 'calculated_locked':
        return {
          container:
            'bg-slate-100 hover:bg-slate-200/80 text-slate-900 border-slate-300 dark:bg-slate-800/90 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
          icon: <Lock className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400 shrink-0" />,
          label: 'Calculated',
          badge: (
            <span
              className="ml-auto text-[10px] font-mono px-1 py-0.2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300 font-medium truncate max-w-[55px] select-none"
              title={formula || 'Calculated field'}
            >
              FORMULA
            </span>
          ),
        };

      case 'requires_approval':
        return {
          container:
            'bg-rose-100/90 hover:bg-rose-200/90 text-rose-950 border-rose-300 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 dark:text-rose-200 dark:border-rose-700 animate-pulse',
          icon: <AlertTriangle className="h-3.5 w-3.5 text-rose-700 dark:text-rose-400 shrink-0" />,
          label: 'Needs QA',
          badge: (
            <span className="ml-auto text-[10px] font-mono px-1 py-0.2 bg-rose-200 dark:bg-rose-900/70 text-rose-950 dark:text-rose-200 font-bold select-none">
              DISCREPANCY
            </span>
          ),
        };

      default:
        return {
          container: 'bg-card text-foreground border-border',
          icon: null,
          label: 'Default',
          badge: null,
        };
    }
  };

  const styles = getAffordanceStyles(state);

  const displayString =
    formattedValue ||
    (typeof value === 'number'
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
      : String(value ?? '—'));

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center justify-between gap-2 px-2.5 py-1.5 border transition-all min-w-[150px] select-text cursor-default ${styles.container} ${
        isSelected
          ? 'ring-2 ring-primary ring-offset-1 border-primary shadow-xs z-10'
          : 'shadow-2xs'
      } ${className}`}
      title={`State: ${styles.label}`}
    >
      {/* Icon & Formatted Value (Selectable with Mouse) */}
      <div className="flex items-center gap-1.5 min-w-0 select-text">
        {styles.icon}
        <span className="font-mono font-bold text-xs tracking-tight truncate select-text cursor-text">
          {displayString}
        </span>
      </div>

      {/* State Badge Pill */}
      {styles.badge}
    </div>
  );
};
