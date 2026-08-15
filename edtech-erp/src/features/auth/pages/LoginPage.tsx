import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLogin } from '../services/auth.service';
import type { UserRole } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  tenantCode: z.string().optional(),
});
type LoginForm = z.infer<typeof loginSchema>;

// Demo users for showcase
const DEMO_USERS: { role: UserRole; email: string; name: string }[] = [
  { role: 'superadmin', email: 'superadmin@educore.app', name: 'Super Admin' },
  { role: 'admin', email: 'admin@demo.school', name: 'School Admin' },
  { role: 'teacher', email: 'teacher@demo.school', name: 'Mrs. Sharma' },
  { role: 'student', email: 'student@demo.school', name: 'Arjun Mehta' },
  { role: 'parent', email: 'parent@demo.school', name: 'Rajesh Mehta' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', tenantCode: '' },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(
      {
        email: data.email,
        password: data.password,
        tenantCode: data.tenantCode || undefined,
      },
      { onSuccess: () => navigate(from, { replace: true }) }
    );
  };

  const loginAs = (email: string) => {
    setValue('email', email);
    setValue('password', 'password123');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col w-[45%] bg-sidebar p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3 mb-auto">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-lg leading-none">EduCore ERP</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">School Management</p>
          </div>
        </div>

        <div className="relative z-10 mt-auto space-y-6">
          <div className="space-y-3">
            <h2 className="font-display font-bold text-4xl text-white leading-tight">
              Manage your<br />institution with<br />
              <span className="text-primary">confidence.</span>
            </h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              A unified platform for students, teachers, parents and administrators. Everything in one place.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {['Attendance Tracking', 'Fee Management', 'Live Classes', 'Reports & Analytics', 'Parent Portal'].map((f) => (
              <span
                key={f}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/8 text-white/60 border border-white/10"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="h-4.5 w-4.5 text-white" />
            </div>
            <p className="font-display font-bold text-xl">EduCore ERP</p>
          </div>

          <div className="space-y-1.5">
            <h1 className="font-display font-bold text-2xl">Sign in to your account</h1>
            <p className="text-sm text-muted-foreground">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              error={errors.password?.message}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...register('password')}
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-input h-4 w-4 accent-primary" />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <Link
                to="/auth/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={loginMutation.isPending}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Demo login shortcuts */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground text-center uppercase tracking-wide font-medium">
              — Demo Quick Login —
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.role}
                  onClick={() => loginAs(u.email)}
                  className="text-left px-3 py-2.5 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <p className="text-xs font-semibold capitalize text-foreground group-hover:text-primary transition-colors">
                    {u.role}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{u.name}</p>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground text-center">
              Click a role to prefill credentials, then sign in. Password: <code className="bg-muted px-1 rounded">password123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
