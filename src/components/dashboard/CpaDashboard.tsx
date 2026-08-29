import React, { useState, useMemo } from 'react';
import { usePlatformStore } from '@/store/usePlatformStore';
import { TriageKpiCards, DashboardKpiFilter } from './TriageKpiCards';
import { DashboardFilters, DashboardFilterState } from './DashboardFilters';
import { TriageQueueCard } from './TriageQueueCard';
import { TeamWorkloadView } from './TeamWorkloadView';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  RefreshCw,
} from 'lucide-react';

interface CpaDashboardProps {
  onOpenReturn?: (returnId: string) => void;
  className?: string;
}

export const CpaDashboard: React.FC<CpaDashboardProps> = ({
  onOpenReturn,
  className = '',
}) => {
  const { returns, currentUser, selectReturn } = usePlatformStore();

  const [kpiFilter, setKpiFilter] = useState<DashboardKpiFilter>('all');
  const [showWorkloadView, setShowWorkloadView] = useState<boolean>(false);

  const [filterState, setFilterState] = useState<DashboardFilterState>({
    searchQuery: '',
    returnType: 'ALL',
    status: 'ALL',
    assignedPreparer: 'ALL',
    blockerOnly: false,
  });

  // Extract unique preparer/staff names
  const preparerNames = useMemo(() => {
    const names = new Set<string>();
    returns.forEach((r) => {
      if (r.assignedPreparerName) names.add(r.assignedPreparerName);
      if (r.assignedReviewerName) names.add(r.assignedReviewerName);
    });
    return Array.from(names);
  }, [returns]);

  // Multi-tier filtering
  const filteredReturns = useMemo(() => {
    return returns.filter((ret) => {
      // 1. KPI Top Card Filter
      if (kpiFilter === 'critical') {
        const isCritical = ret.triageScore >= 90 || (ret.status !== 'E_FILED' && ret.status !== 'ACCEPTED' && ret.dueDate === '2026-03-15');
        if (!isCritical) return false;
      } else if (kpiFilter === 'review') {
        if (ret.status !== 'REVIEW' && ret.nextActionOwner !== 'reviewer') return false;
      } else if (kpiFilter === 'blocked') {
        if (!ret.isBlocked && ret.nextActionOwner !== 'client') return false;
      } else if (kpiFilter === 'filing') {
        if (ret.status !== 'CLIENT_SIGN' && ret.status !== 'E_FILED') return false;
      }

      // 2. Search Query (Taxpayer, entity, email)
      if (filterState.searchQuery.trim()) {
        const q = filterState.searchQuery.toLowerCase();
        const matchesName = ret.taxpayerName.toLowerCase().includes(q);
        const matchesEntity = ret.entityName?.toLowerCase().includes(q);
        const matchesEmail = ret.taxpayerEmail?.toLowerCase().includes(q);
        if (!matchesName && !matchesEntity && !matchesEmail) return false;
      }

      // 3. Return Type
      if (filterState.returnType !== 'ALL' && ret.returnType !== filterState.returnType) {
        return false;
      }

      // 4. Status
      if (filterState.status !== 'ALL' && ret.status !== filterState.status) {
        return false;
      }

      // 5. Assigned Preparer / Staff
      if (filterState.assignedPreparer !== 'ALL') {
        const matchesPrep = ret.assignedPreparerName === filterState.assignedPreparer;
        const matchesRev = ret.assignedReviewerName === filterState.assignedPreparer;
        if (!matchesPrep && !matchesRev) return false;
      }

      // 6. Blocker Toggle
      if (filterState.blockerOnly && !ret.isBlocked) {
        return false;
      }

      return true;
    });
  }, [returns, kpiFilter, filterState]);

  const handleSelectReturn = (returnId: string) => {
    selectReturn(returnId);
    if (onOpenReturn) {
      onOpenReturn(returnId);
    }
  };

  const isReviewerOrManager =
    currentUser.role === 'tax_reviewer' || currentUser.name.includes('Rogers');

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dashboard Top Header Banner */}
      <div className="border border-border bg-card p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-primary text-primary-foreground font-bold">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-foreground">
                CPA Actionable Triage Command Center
              </h1>
              <Badge variant="outline" className="font-mono text-xs capitalize">
                {currentUser.role.replace('_', ' ')}
              </Badge>
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 border-emerald-300 font-mono text-[11px]">
                Tax Season 2026 Active
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Signed in as <strong>{currentUser.name}</strong> • Answers "What return should I work on right now?"
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          {isReviewerOrManager && (
            <Button
              variant={showWorkloadView ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowWorkloadView((prev) => !prev)}
              className="h-8 text-xs gap-1.5 font-semibold"
            >
              <Users className="h-3.5 w-3.5" />
              <span>{showWorkloadView ? 'Hide Team Workload' : 'Team Workload & Capacity'}</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setKpiFilter('all');
              setFilterState({
                searchQuery: '',
                returnType: 'ALL',
                status: 'ALL',
                assignedPreparer: 'ALL',
                blockerOnly: false,
              });
            }}
            className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
            title="Reset queue filters"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 4 Urgency Metric KPI Summary Cards */}
      <TriageKpiCards
        returns={returns}
        activeFilter={kpiFilter}
        onSelectFilter={setKpiFilter}
      />

      {/* Team Workload Distribution (when active) */}
      {showWorkloadView && <TeamWorkloadView returns={returns} />}

      {/* Multi-Faceted Return Search & Filter Bar */}
      <DashboardFilters
        filters={filterState}
        onFilterChange={setFilterState}
        preparerNames={preparerNames}
      />

      {/* Actionable Triage Queue Table */}
      <TriageQueueCard
        returns={filteredReturns}
        onSelectReturn={handleSelectReturn}
      />
    </div>
  );
};
