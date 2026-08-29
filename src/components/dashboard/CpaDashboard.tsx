import React, { useState, useMemo } from 'react';
import { usePlatformStore } from '@/store/usePlatformStore';
import { TriageKpiCards, DashboardKpiFilter } from './TriageKpiCards';
import { DashboardFilters, DashboardFilterState } from './DashboardFilters';
import { TriageQueueCard } from './TriageQueueCard';

interface CpaDashboardProps {
  onOpenReturn?: (returnId: string) => void;
  className?: string;
}

export const CpaDashboard: React.FC<CpaDashboardProps> = ({
  onOpenReturn,
  className = '',
}) => {
  const { returns, selectReturn } = usePlatformStore();

  const [kpiFilter, setKpiFilter] = useState<DashboardKpiFilter>('all');

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

  // Synchronize KPI card selection with the filter bar
  const handleKpiCardSelect = (kpi: DashboardKpiFilter) => {
    setKpiFilter(kpi);

    if (kpi === 'review') {
      setFilterState((prev) => ({ ...prev, status: 'REVIEW', blockerOnly: false }));
    } else if (kpi === 'blocked') {
      setFilterState((prev) => ({ ...prev, status: 'ALL', blockerOnly: true }));
    } else if (kpi === 'filing') {
      setFilterState((prev) => ({ ...prev, status: 'CLIENT_SIGN', blockerOnly: false }));
    } else if (kpi === 'critical') {
      setFilterState((prev) => ({ ...prev, status: 'ALL', blockerOnly: false }));
    } else {
      setFilterState((prev) => ({ ...prev, status: 'ALL', blockerOnly: false }));
    }
  };

  // Synchronize filter bar changes with the top KPI cards
  const handleFilterChange = (newFilters: DashboardFilterState) => {
    setFilterState(newFilters);

    if (newFilters.blockerOnly) {
      setKpiFilter('blocked');
    } else if (newFilters.status === 'REVIEW') {
      setKpiFilter('review');
    } else if (newFilters.status === 'CLIENT_SIGN') {
      setKpiFilter('filing');
    } else {
      setKpiFilter('all');
    }
  };

  // Multi-tier filtering
  const filteredReturns = useMemo(() => {
    return returns.filter((ret) => {
      // 1. Search Query (Taxpayer, entity, email)
      if (filterState.searchQuery.trim()) {
        const q = filterState.searchQuery.toLowerCase();
        const matchesName = ret.taxpayerName.toLowerCase().includes(q);
        const matchesEntity = ret.entityName?.toLowerCase().includes(q);
        const matchesEmail = ret.taxpayerEmail?.toLowerCase().includes(q);
        if (!matchesName && !matchesEntity && !matchesEmail) return false;
      }

      // 2. Return Type
      if (filterState.returnType !== 'ALL' && ret.returnType !== filterState.returnType) {
        return false;
      }

      // 3. Status
      if (filterState.status !== 'ALL' && ret.status !== filterState.status) {
        return false;
      }

      // 4. Blocker Toggle
      if (filterState.blockerOnly && !ret.isBlocked) {
        return false;
      }

      // 5. Assigned Preparer / Staff
      if (filterState.assignedPreparer !== 'ALL') {
        const matchesPrep = ret.assignedPreparerName === filterState.assignedPreparer;
        const matchesRev = ret.assignedReviewerName === filterState.assignedPreparer;
        if (!matchesPrep && !matchesRev) return false;
      }

      // 6. Critical Deadline Window Filter (when critical card is selected)
      if (kpiFilter === 'critical') {
        const isCritical = ret.triageScore >= 90 || (ret.status !== 'E_FILED' && ret.status !== 'ACCEPTED' && ret.dueDate === '2026-03-15');
        if (!isCritical) return false;
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

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 4 Urgency Metric KPI Summary Cards directly */}
      <TriageKpiCards
        returns={returns}
        activeFilter={kpiFilter}
        onSelectFilter={handleKpiCardSelect}
      />

      {/* Multi-Faceted Return Search & Filter Bar */}
      <DashboardFilters
        filters={filterState}
        onFilterChange={handleFilterChange}
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
