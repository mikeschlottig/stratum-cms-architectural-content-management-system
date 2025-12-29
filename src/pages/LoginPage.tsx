import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ShieldCheck, Lock } from 'lucide-react';
import type { AuthResponse } from '@shared/types';
export function LoginPage() {
  const navigate = useNavigate();
  const loginAction = useAuth(s => s.login);
  const [loading, setLoading] = React.useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: { email: 'admin@stratum.io', password: 'stratum123' }
  });
  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await api<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      loginAction(res.user, res.token);
      toast.success(`Welcome back, ${res.user.name}`);
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent opacity-50" />
      <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
        <div className="mb-12 text-center space-y-4 relative z-10">
          <div className="size-20 bg-orange-600 rounded-3xl mx-auto flex items-center justify-center text-white text-5xl font-black shadow-glow-lg animate-pulse">
            S
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white uppercase">Stratum Core</h1>
          <p className="text-zinc-500 font-bold tracking-widest uppercase text-xs">Architectural Content Management</p>
        </div>
        <Card className="w-full max-w-md bg-zinc-900/50 border-zinc-800 backdrop-blur-xl relative z-10 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
              <Lock className="size-4 text-orange-500" /> Secure Initialization
            </CardTitle>
            <CardDescription className="font-medium text-zinc-500">Access your node via secure credentials.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Node Identifier (Email)</Label>
                <Input {...register('email')} className="h-12 bg-zinc-950 border-zinc-800 focus:ring-orange-500/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Security Key (Password)</Label>
                <Input type="password" {...register('password')} className="h-12 bg-zinc-950 border-zinc-800 focus:ring-orange-500/50" />
              </div>
              <Button type="submit" className="w-full btn-gradient h-14 text-base" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2" />}
                Initialize Protocol
              </Button>
            </form>
            <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Demo Node: admin@stratum.io / stratum123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}