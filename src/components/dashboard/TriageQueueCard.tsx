import React from 'react';
import { TaxReturn } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  User,
  Building,
} from 'lucide-react';
import { getTriageUrgency, getUrgencyBadgeStyle } from '@/store/triageLogic';

interface TriageQueueCardProps {
  returns: TaxReturn[];
  onSelectReturn: (returnId: string) => void;
  className?: string;
}

export const TriageQueueCard: React.FC<TriageQueueCardProps> = ({
  returns,
  onSelectReturn,
  className = '',
}) => {
  // Sort returns deterministically by triageScore descending under the hood
  const sortedReturns = [...returns].sort((a, b) => b.triageScore - a.triageScore);

  const getNextActionBadge = (owner: string) => {
    switch (owner) {
      case 'reviewer':
        return (
          <Badge className="bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-200 border-purple-300 font-mono text-[10px]">
            Partner Review
          </Badge>
        );
      case 'preparer':
        return (
          <Badge className="bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-200 border-blue-300 font-mono text-[10px]">
            Preparer Work
          </Badge>
        );
      case 'client':
        return (
          <Badge className="bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 border-amber-400 font-mono text-[10px] animate-pulse">
            Waiting on Client
          </Badge>
        );
      case 'irs':
        return (
          <Badge className="bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 border-emerald-300 font-mono text-[10px]">
            IRS Submission
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={`border border-border bg-card shadow-xs ${className}`}>
      <CardHeader className="p-4 border-b border-border bg-muted/20 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-bold text-foreground">
            Actionable Triage Queue
          </CardTitle>
          <Badge variant="outline" className="font-mono text-xs">
            {sortedReturns.length} active returns
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Ranked deterministically by deadline, blocker severity, and review readiness
        </span>
      </CardHeader>

      <CardContent className="p-0">
        {/* Horizontal scroll safe container with min-width */}
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left border-collapse min-w-[920px]">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-2.5 px-3.5 w-28 text-center">Priority</th>
                <th className="py-2.5 px-3 min-w-[220px]">Taxpayer / Entity</th>
                <th className="py-2.5 px-3 w-32">Deadline</th>
                <th className="py-2.5 px-3 w-32">Status</th>
                <th className="py-2.5 px-3 min-w-[240px]">Immediate Next Action</th>
                <th className="py-2.5 px-3 w-40">Assigned Team</th>
                <th className="py-2.5 px-3.5 w-28 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {sortedReturns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-muted-foreground">
                    No tax returns matched the selected filter criteria.
                  </td>
                </tr>
              ) : (
                sortedReturns.map((ret) => {
                  const urgency = getTriageUrgency(ret.triageScore);
                  const urgencyBadge = getUrgencyBadgeStyle(urgency);
                  const isBlocked = ret.isBlocked;

                  return (
                    <tr
                      key={ret.id}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={() => onSelectReturn(ret.id)}
                    >
                      {/* Priority Category Badge Only (No numbers) */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0.5 font-mono font-semibold ${urgencyBadge.className}`}
                        >
                          {urgencyBadge.label}
                        </Badge>
                      </td>

                      {/* Taxpayer / Entity (No doc count) */}
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-bold text-foreground group-hover:text-primary transition-colors">
                            {ret.entityName ? (
                              <Building className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            ) : (
                              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            )}
                            <span className="truncate max-w-[220px]" title={ret.taxpayerName}>
                              {ret.taxpayerName}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                            <Badge variant="secondary" className="text-[10px] px-1 py-0 font-bold">
                              {ret.returnType}
                            </Badge>
                            <span>•</span>
                            <span>TY {ret.taxYear}</span>
                          </div>
                        </div>
                      </td>

                      {/* Deadline */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-xs font-mono font-bold text-foreground">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{new Date(ret.dueDate).toLocaleDateString()}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono block">
                            {ret.dueDate === '2026-03-15' ? 'Due in <15 days' : 'Due in 45 days'}
                          </span>
                        </div>
                      </td>

                      {/* Status Only (No AI Conf) */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <Badge
                          variant={isBlocked ? 'destructive' : 'outline'}
                          className="text-[10px] font-mono uppercase"
                        >
                          {isBlocked ? 'BLOCKED' : ret.status}
                        </Badge>
                      </td>

                      {/* Immediate Next Action */}
                      <td className="py-3 px-3">
                        <div className="space-y-1 max-w-sm">
                          <div className="flex items-center gap-1.5">
                            {getNextActionBadge(ret.nextActionOwner)}
                            {isBlocked && (
                              <span className="flex items-center gap-0.5 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                                <AlertTriangle className="h-3 w-3 shrink-0" />
                                <span>Blocked</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-foreground font-medium line-clamp-2 leading-tight">
                            {ret.blockerReason || ret.nextActionDescription || 'Review Form 1040 line items'}
                          </p>
                        </div>
                      </td>

                      {/* Assigned Team */}
                      <td className="py-3 px-3 text-[11px] text-muted-foreground font-mono whitespace-nowrap">
                        <p className="truncate" title={ret.assignedPreparerName}>
                          Prep: <strong className="text-foreground">{ret.assignedPreparerName?.split(' ')[0]}</strong>
                        </p>
                        <p className="truncate" title={ret.assignedReviewerName}>
                          Rev: <strong className="text-foreground">{ret.assignedReviewerName?.split(' ')[0]}</strong>
                        </p>
                      </td>

                      {/* Primary Action Button (Contextual) */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant={isBlocked ? 'destructive' : 'default'}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectReturn(ret.id);
                          }}
                          className="h-7 w-24 text-xs font-semibold gap-1 justify-center inline-flex"
                        >
                          <span>{isBlocked ? 'Resolve' : ret.status === 'REVIEW' ? 'Review' : ret.status === 'PREPARATION' ? 'Prepare' : 'Open'}</span>
                          <ArrowRight className="h-3 w-3 shrink-0" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
