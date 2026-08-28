import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, ShieldCheck, FileSpreadsheet } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-violet-600" />
              MiraFlores AI Tax Platform
            </h1>
            <p className="text-sm text-slate-500">
              Autonomous Tax Preparation & Review System • Phase 1 Ready
            </p>
          </div>
          <Badge variant="verified" className="gap-1.5 py-1 px-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            Infrastructure Initialized
          </Badge>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
                Preset buHOvz6
              </CardTitle>
              <CardDescription>shadcn/ui + Tailwind v4</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600">
                Tailwind CSS v4.3 configured with container-level horizontal scroll and custom scrollbars.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-600" />
                Pure Ephemeral
              </CardTitle>
              <CardDescription>In-Memory Zustand Store</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600">
                Synchronous reactivity across mounted components without LocalStorage serialization complexity.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Avengers Dataset
              </CardTitle>
              <CardDescription>8 Returns • 120+ Documents</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600">
                Tony Stark, Peter Parker, Natasha Romanoff, Wakanda Tech, and Bruce Banner personal return.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="default" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Ready for Phase 2 (Foundational Data)
          </Button>
        </div>
      </div>
    </div>
  );
}
