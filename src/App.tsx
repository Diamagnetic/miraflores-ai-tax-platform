import { useState } from 'react';
import { Header } from '@/components/common/Header';
import { usePlatformStore } from '@/store/usePlatformStore';
import { ReturnReviewWorkbench } from '@/components/return-review/ReturnReviewWorkbench';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileSpreadsheet,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  const { returns, documents, currentUser } = usePlatformStore();
  const [activeTab, setActiveTab] = useState<'review' | 'overview'>('review');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      <Header />

      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Banner / Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border bg-card p-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                {currentUser.name}
              </h1>
              <Badge variant="outline" className="font-mono text-xs capitalize">
                {currentUser.isPersonalReturnView
                  ? 'Personal Return Mode'
                  : currentUser.role.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              AI Tax Platform Workbench • {returns.length} Avengers Returns • {documents.length} Source Documents & Receipts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('review')}
              className={`h-8 text-xs font-semibold gap-1.5 border ${
                activeTab === 'review'
                  ? 'bg-primary text-primary-foreground border-primary font-bold'
                  : 'text-muted-foreground'
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Side-by-Side Review (MVP)
            </Button>

            <Badge variant="outline" className="gap-1.5 py-1 px-2.5 text-xs text-emerald-700 bg-emerald-50 border-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Phase 3 Live
            </Badge>
          </div>
        </div>

        {/* Primary Content: Phase 3 Side-by-Side Review Workbench */}
        <ReturnReviewWorkbench />
      </main>
    </div>
  );
}
