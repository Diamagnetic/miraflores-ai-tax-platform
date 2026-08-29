import React from 'react';
import { TaxReturn } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Clock, FileCheck, ArrowRight } from 'lucide-react';

export type DashboardKpiFilter = 'all' | 'critical' | 'review' | 'blocked' | 'filing';

interface TriageKpiCardsProps {
  returns: TaxReturn[];
  activeFilter: DashboardKpiFilter;
  onSelectFilter: (filter: DashboardKpiFilter) => void;
  className?: string;
}

export const TriageKpiCards: React.FC<TriageKpiCardsProps> = ({
  returns,
  activeFilter,
  onSelectFilter,
  className = '',
}) => {
  // 1. Critical Deadlines: Triage score >= 90 or due in <= 15 days
  const criticalReturns = returns.filter(
    (r) => r.triageScore >= 90 || (r.status !== 'E_FILED' && r.status !== 'ACCEPTED' && r.dueDate === '2026-03-15')
  );

  // 2. Ready for Review: status is REVIEW or next action is reviewer
  const readyForReview = returns.filter((r) => r.status === 'REVIEW' || r.nextActionOwner === 'reviewer');

  // 3. Blocked on Client: isBlocked is true or next action is client
  const blockedOnClient = returns.filter((r) => r.isBlocked || r.nextActionOwner === 'client');

  // 4. Ready to File / Sign: CLIENT_SIGN or ready for submission
  const readyToFile = returns.filter((r) => r.status === 'CLIENT_SIGN' || r.status === 'E_FILED');

  const cards = [
    {
      id: 'critical' as DashboardKpiFilter,
      label: 'Critical / At-Risk',
      count: criticalReturns.length,
      icon: AlertCircle,
      accentColor: 'border-l-4 border-l-rose-500 bg-rose-50/40 dark:bg-rose-950/20 text-rose-950 dark:text-rose-200',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200',
      actionText: 'Triage Urgent',
    },
    {
      id: 'review' as DashboardKpiFilter,
      label: 'Ready for Review',
      count: readyForReview.length,
      icon: CheckCircle2,
      accentColor: 'border-l-4 border-l-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
      actionText: 'Start Review',
    },
    {
      id: 'blocked' as DashboardKpiFilter,
      label: 'Blocked on Client',
      count: blockedOnClient.length,
      icon: Clock,
      accentColor: 'border-l-4 border-l-amber-500 bg-amber-50/40 dark:bg-amber-950/20 text-amber-950 dark:text-amber-200',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
      actionText: 'Send Nudges',
    },
    {
      id: 'filing' as DashboardKpiFilter,
      label: 'Ready to File / Sign',
      count: readyToFile.length,
      icon: FileCheck,
      accentColor: 'border-l-4 border-l-blue-600 bg-blue-50/40 dark:bg-blue-950/20 text-blue-950 dark:text-blue-200',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200',
      actionText: 'Transmit IRS',
    },
  ];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 ${className}`}>
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeFilter === card.id;

        return (
          <Card
            key={card.id}
            onClick={() => onSelectFilter(isSelected ? 'all' : card.id)}
            className={`cursor-pointer transition-all duration-150 border hover:shadow-md select-none ${card.accentColor} ${
              isSelected ? 'ring-2 ring-primary shadow-sm scale-[1.01]' : 'border-border'
            }`}
          >
            <CardContent className="p-3.5 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-xs font-bold uppercase tracking-wider block truncate opacity-85">
                    {card.label}
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-mono font-extrabold tracking-tight">
                      {card.count}
                    </span>
                    <span className="text-[11px] opacity-75 font-sans">returns</span>
                  </div>
                </div>
                <div className={`p-2 rounded-none ${card.badgeColor}`}>
                  <Icon className="h-4 w-4 shrink-0" />
                </div>
              </div>

              <div className="pt-2 border-t border-border/40 flex items-center justify-end text-[11px]">
                <span className="font-semibold flex items-center gap-0.5 text-primary hover:underline">
                  {card.actionText}
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
