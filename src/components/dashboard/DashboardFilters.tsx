import React from 'react';
import { ReturnStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Search, Filter, X, RotateCcw } from 'lucide-react';

export interface DashboardFilterState {
  searchQuery: string;
  returnType: string;
  status: ReturnStatus | 'ALL';
  assignedPreparer: string;
  blockerOnly: boolean;
}

interface DashboardFiltersProps {
  filters: DashboardFilterState;
  onFilterChange: (newFilters: DashboardFilterState) => void;
  preparerNames: string[];
  className?: string;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  onFilterChange,
  preparerNames,
  className = '',
}) => {
  const hasActiveFilters =
    Boolean(filters.searchQuery) ||
    filters.returnType !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.assignedPreparer !== 'ALL' ||
    filters.blockerOnly;

  const handleReset = () => {
    onFilterChange({
      searchQuery: '',
      returnType: 'ALL',
      status: 'ALL',
      assignedPreparer: 'ALL',
      blockerOnly: false,
    });
  };

  return (
    <div className={`border border-border bg-card p-3 shadow-xs space-y-2.5 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search taxpayer name, company, or email..."
            value={filters.searchQuery}
            onChange={(e) =>
              onFilterChange({ ...filters, searchQuery: e.target.value })
            }
            className="w-full h-8 pl-8 pr-7 bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Return Type */}
          <div className="flex items-center gap-1 border border-border bg-background px-2 h-8 text-xs">
            <span className="text-[10px] text-muted-foreground font-semibold">Form:</span>
            <select
              aria-label="Filter by return form type"
              value={filters.returnType}
              onChange={(e) =>
                onFilterChange({ ...filters, returnType: e.target.value })
              }
              className="bg-transparent border-0 text-xs font-medium text-foreground focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Forms</option>
              <option value="1040">Form 1040 (Individual)</option>
              <option value="1120S">Form 1120-S (S-Corp)</option>
              <option value="1065">Form 1065 (Partnership)</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1 border border-border bg-background px-2 h-8 text-xs">
            <span className="text-[10px] text-muted-foreground font-semibold">Status:</span>
            <select
              aria-label="Filter by return workflow status"
              value={filters.status}
              onChange={(e) =>
                onFilterChange({ ...filters, status: e.target.value as ReturnStatus | 'ALL' })
              }
              className="bg-transparent border-0 text-xs font-medium text-foreground focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="INTAKE">Intake</option>
              <option value="EXTRACTION">Extraction</option>
              <option value="PREPARATION">Preparation</option>
              <option value="REVIEW">Ready for Review</option>
              <option value="CLIENT_SIGN">Client Signature</option>
              <option value="E_FILED">E-Filed</option>
              <option value="ACCEPTED">Accepted</option>
            </select>
          </div>

          {/* Assigned Staff */}
          <div className="flex items-center gap-1 border border-border bg-background px-2 h-8 text-xs">
            <span className="text-[10px] text-muted-foreground font-semibold">Staff:</span>
            <select
              aria-label="Filter by assigned staff member"
              value={filters.assignedPreparer}
              onChange={(e) =>
                onFilterChange({ ...filters, assignedPreparer: e.target.value })
              }
              className="bg-transparent border-0 text-xs font-medium text-foreground focus:outline-none cursor-pointer max-w-[140px] truncate"
            >
              <option value="ALL">All Staff</option>
              {preparerNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Blocker Toggle */}
          <Button
            type="button"
            variant={filters.blockerOnly ? 'destructive' : 'outline'}
            size="sm"
            onClick={() =>
              onFilterChange({ ...filters, blockerOnly: !filters.blockerOnly })
            }
            className="h-8 text-xs gap-1.5 font-semibold"
          >
            <Filter className="h-3 w-3" />
            <span>Blocked Only</span>
          </Button>

          {/* Reset All */}
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
              title="Reset all filters"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
