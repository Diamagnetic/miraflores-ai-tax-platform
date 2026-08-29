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
            'bg-purple-50/80 hover:bg-purple-100/80 text-purple-950 border-purple-300 dark:bg-purple-950/30 dark:hover:bg-purple-900/40 dark:text-purple-200 dark:border-purple-800',
          icon: <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />,
          label: 'AI Extracted',
          badge: aiConfidence ? (
            <span className="ml-auto text-[10px] font-mono px-1 py-0.2 bg-purple-200/80 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 font-bold">
              {aiConfidence}%
            </span>
          ) : null,
        };

      case 'verified':
        return {
          container:
            'bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-950 border-emerald-300 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-800',
          icon: <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
          label: 'Verified',
          badge: (
            <span className="ml-auto text-[10px] font-mono px-1 py-0.2 bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold">
              LOCKED
            </span>
          ),
        };

      case 'user_edited':
        return {
          container:
            'bg-sky-50/80 hover:bg-sky-100/80 text-sky-950 border-sky-300 dark:bg-sky-950/30 dark:hover:bg-sky-900/40 dark:text-sky-200 dark:border-sky-800',
          icon: <Edit3 className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" />,
          label: 'Manual Edit',
          badge: (
            <span
              className="ml-auto text-[10px] font-mono px-1 py-0.2 bg-sky-200/80 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 font-bold"
              title={auditHistory && auditHistory.length > 0 ? `Edited by ${auditHistory[0].changedBy}: ${auditHistory[0].reason || 'Manual override'}` : 'Manual override'}
            >
              EDITED
            </span>
          ),
        };

      case 'calculated_locked':
        return {
          container:
            'bg-slate-100/90 hover:bg-slate-200/70 text-slate-800 border-slate-300 dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
          icon: <Lock className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 shrink-0" />,
          label: 'Calculated',
          badge: (
            <span
              className="ml-auto text-[10px] font-mono px-1 py-0.2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium truncate max-w-[55px]"
              title={formula || 'Calculated field'}
            >
              FORMULA
            </span>
          ),
        };

      case 'requires_approval':
        return {
          container:
            'bg-rose-50/90 hover:bg-rose-100/90 text-rose-950 border-rose-300 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 dark:text-rose-200 dark:border-rose-800 animate-pulse',
          icon: <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />,
          label: 'Needs QA',
          badge: (
            <span className="ml-auto text-[10px] font-mono px-1 py-0.2 bg-rose-200/90 dark:bg-rose-900/70 text-rose-900 dark:text-rose-200 font-bold">
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
      className={`group relative flex items-center justify-between gap-2 px-2.5 py-1.5 border transition-all cursor-pointer select-none min-w-[150px] ${styles.container} ${
        isSelected
          ? 'ring-2 ring-primary ring-offset-1 border-primary shadow-xs z-10'
          : 'shadow-2xs'
      } ${className}`}
      title={`State: ${styles.label} • Click to inspect source traceability`}
    >
      {/* Icon & Formatted Value */}
      <div className="flex items-center gap-1.5 min-w-0">
        {styles.icon}
        <span className="font-mono font-bold text-xs tracking-tight truncate">
          {displayString}
        </span>
      </div>

      {/* State Badge Pill */}
      {styles.badge}
    </div>
  );
};
