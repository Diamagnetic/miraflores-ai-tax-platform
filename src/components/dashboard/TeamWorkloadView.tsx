import React from 'react';
import { TaxReturn } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, AlertTriangle } from 'lucide-react';

interface TeamWorkloadViewProps {
  returns: TaxReturn[];
  className?: string;
}

interface StaffWorkload {
  name: string;
  role: string;
  totalReturns: number;
  inPrep: number;
  inReview: number;
  blocked: number;
  readyToFile: number;
  capacityLimit: number;
}

export const TeamWorkloadView: React.FC<TeamWorkloadViewProps> = ({
  returns,
  className = '',
}) => {
  // Aggregate staff assignments
  const staffMap: { [name: string]: StaffWorkload } = {
    'Sam Wilson': {
      name: 'Sam Wilson',
      role: 'Lead Tax Preparer',
      totalReturns: 0,
      inPrep: 0,
      inReview: 0,
      blocked: 0,
      readyToFile: 0,
      capacityLimit: 12,
    },
    'Steve Rogers': {
      name: 'Steve Rogers',
      role: 'Senior Reviewer & Partner',
      totalReturns: 0,
      inPrep: 0,
      inReview: 0,
      blocked: 0,
      readyToFile: 0,
      capacityLimit: 15,
    },
    'Natasha Romanoff': {
      name: 'Natasha Romanoff',
      role: 'International Tax Specialist',
      totalReturns: 0,
      inPrep: 0,
      inReview: 0,
      blocked: 0,
      readyToFile: 0,
      capacityLimit: 8,
    },
    'Bruce Banner': {
      name: 'Bruce Banner',
      role: 'Corporate Tax Specialist',
      totalReturns: 0,
      inPrep: 0,
      inReview: 0,
      blocked: 0,
      readyToFile: 0,
      capacityLimit: 10,
    },
  };

  returns.forEach((ret) => {
    const prepName = ret.assignedPreparerName?.split(' ')[0] + ' ' + ret.assignedPreparerName?.split(' ')[1];
    const revName = ret.assignedReviewerName?.split(' ')[0] + ' ' + ret.assignedReviewerName?.split(' ')[1];

    const staffKey = staffMap[prepName] ? prepName : staffMap[revName] ? revName : 'Sam Wilson';
    const staff = staffMap[staffKey];

    if (staff) {
      staff.totalReturns += 1;
      if (ret.isBlocked) staff.blocked += 1;
      else if (ret.status === 'REVIEW') staff.inReview += 1;
      else if (ret.status === 'PREPARATION' || ret.status === 'EXTRACTION') staff.inPrep += 1;
      else staff.readyToFile += 1;
    }
  });

  const staffList = Object.values(staffMap);

  return (
    <Card className={`border border-border bg-card shadow-xs ${className}`}>
      <CardHeader className="p-4 border-b border-border bg-muted/20 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-bold text-foreground">
            Staff Workload & Capacity Distribution
          </CardTitle>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {returns.length} returns distributed across {staffList.length} staff
        </span>
      </CardHeader>

      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {staffList.map((staff) => {
          const loadPercent = Math.min(100, Math.round((staff.totalReturns / staff.capacityLimit) * 100));
          const isNearCapacity = loadPercent >= 80;

          return (
            <div
              key={staff.name}
              className="p-3.5 border border-border bg-muted/10 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-foreground truncate">{staff.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{staff.role}</p>
                  </div>
                  <Badge
                    variant={isNearCapacity ? 'destructive' : 'secondary'}
                    className="font-mono text-[9px] px-1 py-0"
                  >
                    {staff.totalReturns}/{staff.capacityLimit} returns
                  </Badge>
                </div>

                {/* Capacity Progress Bar */}
                <div className="mt-2.5 space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                    <span>Capacity Load</span>
                    <span className={isNearCapacity ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}>
                      {loadPercent}%
                    </span>
                  </div>
                  <Progress value={loadPercent} className="h-1.5" />
                </div>
              </div>

              {/* Status Breakdown Pills */}
              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-border/40 text-[10px] font-mono text-center">
                <div className="bg-blue-50/50 dark:bg-blue-950/30 p-1 border border-blue-200 dark:border-blue-900/40">
                  <span className="text-muted-foreground block text-[9px]">In Prep</span>
                  <strong className="text-blue-900 dark:text-blue-200 font-bold">{staff.inPrep}</strong>
                </div>

                <div className="bg-purple-50/50 dark:bg-purple-950/30 p-1 border border-purple-200 dark:border-purple-900/40">
                  <span className="text-muted-foreground block text-[9px]">Review</span>
                  <strong className="text-purple-900 dark:text-purple-200 font-bold">{staff.inReview}</strong>
                </div>

                <div className="bg-amber-50/50 dark:bg-amber-950/30 p-1 border border-amber-200 dark:border-amber-900/40">
                  <span className="text-muted-foreground block text-[9px]">Blocked</span>
                  <strong className="text-amber-900 dark:text-amber-200 font-bold flex items-center justify-center gap-0.5">
                    {staff.blocked > 0 && <AlertTriangle className="h-2.5 w-2.5 text-amber-600 shrink-0" />}
                    {staff.blocked}
                  </strong>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
