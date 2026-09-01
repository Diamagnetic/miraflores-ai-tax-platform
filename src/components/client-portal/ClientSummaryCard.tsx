import React from 'react';
import { TaxReturn } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileSpreadsheet,
  User,
  MessageSquare,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ClientSummaryCardProps {
  activeReturn: TaxReturn;
  onOpenMessages?: () => void;
  className?: string;
}

export const ClientSummaryCard: React.FC<ClientSummaryCardProps> = ({
  activeReturn,
  onOpenMessages,
  className = '',
}) => {
  const isRefund = activeReturn.refundOrDueAmount >= 0;

  return (
    <Card className={`border border-border bg-card shadow-xs ${className}`}>
      <CardHeader className="p-4 border-b border-border bg-muted/20 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-bold text-foreground">
            Tax Return Summary ({activeReturn.returnType})
          </CardTitle>
        </div>
        <Badge variant="outline" className="font-mono text-xs">
          Tax Year {activeReturn.taxYear}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Financial Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Estimated Refund / Balance Due */}
          <div className="p-3.5 border border-border bg-muted/10 space-y-1">
            <span className="text-[10px] text-muted-foreground font-mono uppercase block">
              {isRefund ? 'Estimated Refund' : 'Estimated Tax Due'}
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-xl font-mono font-extrabold ${
                  isRefund
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-700 dark:text-amber-400'
                }`}
              >
                {formatCurrency(Math.abs(activeReturn.refundOrDueAmount))}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground block">
              {activeReturn.documentCount === 0
                ? 'Calculated after document upload'
                : isRefund
                ? 'Direct deposit to bank on file'
                : 'IRS payment due by April 15'}
            </span>
          </div>

          {/* Adjusted Gross Income */}
          <div className="p-3.5 border border-border bg-muted/10 space-y-1">
            <span className="text-[10px] text-muted-foreground font-mono uppercase block">
              Total Reported Income (AGI)
            </span>
            <span className="text-xl font-mono font-extrabold text-foreground block">
              {formatCurrency(activeReturn.totalIncome)}
            </span>
            <span className="text-[10px] text-muted-foreground block">
              {activeReturn.documentCount === 0 ? 'Pending document upload' : 'W-2 wages, 1099 freelance, & investments'}
            </span>
          </div>

          {/* Total Federal Tax Liability */}
          <div className="p-3.5 border border-border bg-muted/10 space-y-1">
            <span className="text-[10px] text-muted-foreground font-mono uppercase block">
              Calculated Tax Liability
            </span>
            <span className="text-xl font-mono font-extrabold text-foreground block">
              {formatCurrency(activeReturn.taxLiability)}
            </span>
            <span className="text-[10px] text-muted-foreground block">
              {activeReturn.documentCount === 0 ? 'Pending CPA preparation' : 'IRS statutory brackets & credits applied'}
            </span>
          </div>
        </div>

        {/* Assigned CPA & Filing Deadlines */}
        <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Assigned CPA: <strong>{activeReturn.assignedPreparerName}</strong>
              </p>
              <p className="text-[11px] text-muted-foreground">
                MiraFlores Certified Tax Advisors • Reviewer: {activeReturn.assignedReviewerName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
            <div className="text-right hidden sm:block mr-2 font-mono text-[11px] text-muted-foreground">
              <span>Deadline: </span>
              <strong className="text-foreground">{new Date(activeReturn.dueDate).toLocaleDateString()}</strong>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onOpenMessages}
              className="h-8 text-xs gap-1.5 font-semibold text-foreground hover:bg-muted"
            >
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              <span>Message {activeReturn.assignedPreparerName?.split(' ')[0] || 'CPA'}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
