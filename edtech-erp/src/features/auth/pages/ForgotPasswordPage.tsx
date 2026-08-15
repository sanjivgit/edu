import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Mail, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks';
import { authService } from '../services/auth.service';

// ─── Shared Auth Layout ─────────────────────────────────────────────────────────
function AuthCard({ children, title, description }: {
  children: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="flex items-center gap-3 justify-center">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
            <Zap className="h-4.5 w-4.5 text-white" />
          </div>
          <p className="font-display font-bold text-xl">EduCore ERP</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-8 shadow-card space-y-6">
          <div className="text-center space-y-1">
            <h1 className="font-display font-bold text-xl">{title}</h1>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {children}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          <Link to="/auth/login" className="inline-flex items-center gap-1 text-primary hover:underline">
            <ArrowLeft className="h-3 w-3" /> Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── Forgot Password ────────────────────────────────────────────────────────────
const forgotSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

export function ForgotPasswordPageComponent() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async ({ email }: { email: string } | any) => {
    try {
      const res = await authService.forgotPassword(email);
      success('OTP Sent', res.message ?? `Check your inbox at ${email}`);
      setSent(true);
      setTimeout(() => navigate('/auth/otp-verify', { state: { email, purpose: 'reset-password' } }), 1200);
    } catch {
      error('Failed', 'Something went wrong sending the OTP.');
    }
  };

  return (
    <AuthCard
      title="Forgot Password"
      description="We'll send an OTP to your registered email address"
    >
      {!sent ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@school.com"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message as string}
            {...register('email')}
          />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Send OTP
          </Button>
        </form>
      ) : (
        <div className="text-center py-4 space-y-2">
          <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
            <Mail className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-sm text-muted-foreground">OTP sent! Redirecting...</p>
        </div>
      )}
    </AuthCard>
  );
}

// ─── OTP Verify ─────────────────────────────────────────────────────────────────
export function OtpVerifyPageComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error } = useToast();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);

  const email = (location.state as { email?: string } | null)?.email ?? '';

  const handleChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) return;
    setIsLoading(true);
    // The backend validates the OTP inside reset-password, so pass it along.
    await new Promise((r) => setTimeout(r, 400));
    setIsLoading(false);
    navigate('/auth/reset-password', { state: { email, otp: code } });
  };

  const handleResend = async () => {
    try {
      await authService.resendOtp({ email, purpose: 'reset-password' });
      success('OTP Sent', 'A new OTP has been sent to your email.');
    } catch {
      error('Failed', 'Could not resend the OTP.');
    }
  };

  return (
    <AuthCard title="Verify OTP" description="Enter the 6-digit code sent to your email">
      <div className="space-y-6">
        <div className="flex gap-2.5 justify-center">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              id={`otp-${idx}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="h-12 w-11 text-center text-lg font-bold font-display border-2 border-input rounded-xl bg-background focus:outline-none focus:border-primary transition-colors"
            />
          ))}
        </div>
        <Button
          className="w-full"
          onClick={handleVerify}
          isLoading={isLoading}
          disabled={otp.join('').length < 6}
        >
          Verify OTP
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Didn't receive it?{' '}
          <button className="text-primary hover:underline font-medium" onClick={handleResend}>
            Resend OTP
          </button>
        </p>
      </div>
    </AuthCard>
  );
}

// ─── Reset Password ─────────────────────────────────────────────────────────────
const resetSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export function ResetPasswordPageComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error } = useToast();

  const email = (location.state as { email?: string } | null)?.email ?? '';
  const otp = (location.state as { otp?: string } | null)?.otp ?? '';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (values: { password: string } | any) => {
    if (!email || !otp) {
      error('Missing details', 'Please restart the reset process.');
      navigate('/auth/forgot-password');
      return;
    }
    try {
      await authService.resetPassword({ email, otp, newPassword: values.password });
      success('Password Reset', 'Your password has been updated successfully');
      setTimeout(() => navigate('/auth/login'), 1200);
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      error('Reset failed', msg ?? 'Something went wrong resetting the password.');
    }
  };

  return (
    <AuthCard title="Reset Password" description="Create a new secure password for your account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="New Password"
          type="password"
          placeholder="Min. 8 characters"
          error={errors.password?.message as string}
          {...register('password')}
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="Repeat your password"
          error={errors.confirmPassword?.message as string}
          {...register('confirmPassword')}
        />
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Reset Password
        </Button>
      </form>
    </AuthCard>
  );
}

export default ForgotPasswordPageComponent;
