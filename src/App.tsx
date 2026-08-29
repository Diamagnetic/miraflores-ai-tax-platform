import { Header } from '@/components/common/Header';
import { ReturnReviewWorkbench } from '@/components/return-review/ReturnReviewWorkbench';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      <Header />

      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
        <ReturnReviewWorkbench />
      </main>
    </div>
  );
}
