import { useState, useEffect } from 'react';
import { usePlatformStore } from '@/store/usePlatformStore';
import { Header } from '@/components/common/Header';
import { ReturnReviewWorkbench } from '@/components/return-review/ReturnReviewWorkbench';
import { CpaDashboard } from '@/components/dashboard/CpaDashboard';
import { ClientPortalView } from '@/components/client-portal/ClientPortalView';
import { SavedLoginsScreen } from '@/components/auth/SavedLoginsScreen';
import { CpaStatusStepper } from '@/components/status/CpaStatusStepper';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, FileSpreadsheet, ArrowLeft } from 'lucide-react';

export default function App() {
  const { currentUser, returns, selectedReturnId, isAuthenticated } = usePlatformStore();
  const [activeStaffView, setActiveStaffView] = useState<'dashboard' | 'workbench'>('dashboard');
  const [isClientDiscussionOpen, setIsClientDiscussionOpen] = useState<boolean>(false);

  // Reset scroll whenever switching between dashboard and workbench
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeStaffView]);

  // Whenever a firm employee logs in or switches user, ensure they land on the Triage Command Center
  useEffect(() => {
    if (currentUser.role === 'tax_preparer' || currentUser.role === 'tax_reviewer') {
      setActiveStaffView('dashboard');
    }
  }, [currentUser.userId]);

  // If user signed out, present the authentic Saved Logins Account Chooser landing screen
  if (!isAuthenticated) {
    return <SavedLoginsScreen />;
  }

  const isStaff =
    currentUser.role === 'tax_preparer' || currentUser.role === 'tax_reviewer';

  const activeReturn = returns.find((r) => r.id === selectedReturnId) || returns[0];

  const handleOpenReturn = (_returnId: string) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setActiveStaffView('workbench');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      <Header
        onOpenClientMessages={() => setIsClientDiscussionOpen(true)}
      />

      {/* Staff View Navigation Bar */}
      {isStaff && (
        <div className="bg-muted/40 border-b border-border px-4 sm:px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveStaffView('dashboard')}
              className={`h-7 px-3 text-xs font-semibold gap-1.5 border ${
                activeStaffView === 'dashboard'
                  ? 'bg-card text-foreground border-border shadow-2xs font-bold'
                  : 'text-muted-foreground border-transparent hover:border-border'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Triage Command Center</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveStaffView('workbench')}
              className={`h-7 px-3 text-xs font-semibold gap-1.5 border ${
                activeStaffView === 'workbench'
                  ? 'bg-card text-foreground border-border shadow-2xs font-bold'
                  : 'text-muted-foreground border-transparent hover:border-border'
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Return Workbench: {activeReturn?.taxpayerName}</span>
            </Button>
          </div>

          {activeStaffView === 'workbench' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveStaffView('dashboard')}
              className="h-7 text-xs gap-1 font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Triage Queue</span>
            </Button>
          )}
        </div>
      )}

      {/* 7-Step Progress Stepper directly below navbar without background */}
      {isStaff && activeStaffView === 'workbench' && activeReturn && (
        <div className="pt-4 pb-1 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <CpaStatusStepper activeReturn={activeReturn} />
          </div>
        </div>
      )}

      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
        {isStaff ? (
          activeStaffView === 'dashboard' ? (
            <CpaDashboard onOpenReturn={handleOpenReturn} />
          ) : (
            <ReturnReviewWorkbench />
          )
        ) : (
          <ClientPortalView
            isDiscussionOpen={isClientDiscussionOpen}
            onOpenDiscussion={() => setIsClientDiscussionOpen(true)}
            onCloseDiscussion={() => setIsClientDiscussionOpen(false)}
          />
        )}
      </main>
    </div>
  );
}
