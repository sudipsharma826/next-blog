import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="p-8 flex flex-col items-center gap-4 max-w-md w-full">
        <Loader2 className="animate-spin w-10 h-10 text-primary" />
        <h2 className="text-xl font-semibold">Verifying your email…</h2>
        <p className="text-muted-foreground text-center">Please wait while we verify your email address. You will be redirected if successful.</p>
      </Card>
    </div>
  );
}