"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMessage("Check your email for the confirmation link.");
        setIsSignUp(false); // Switch to login mode
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--color-background)]">
      {/* Left side - Branding */}
      <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[var(--color-card-border)] bg-[var(--color-foreground)]/5 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-accent-primary)]/20 blur-[100px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-accent-positive)]/20 blur-[100px] rounded-full"></div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center">
              <img src="/logo-light.png" alt="Finacle Logo" className="w-72 md:w-96 h-auto object-contain dark:hidden" />
              <img src="/logo-dark.png" alt="Finacle Logo" className="w-72 md:w-96 h-auto object-contain hidden dark:block" />
            </div>
            <div className="md:hidden">
              <ThemeToggle />
            </div>
          </div>
          
          <div className="mt-20">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
              Master your money. <br />
              <span className="text-[var(--color-accent-primary)]">Optimize your life.</span>
            </h1>
            <p className="text-lg opacity-80 max-w-md leading-relaxed">
              Premium personal finance management with AI-driven insights to help you make smarter decisions.
            </p>
          </div>
        </div>

        <div className="hidden md:block">
          <ThemeToggle />
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 p-8 md:p-12 flex items-center justify-center relative">
        <div className="w-full max-w-md glass-panel p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold mb-2">{isSignUp ? "Create Account" : "Welcome Back"}</h2>
            <p className="opacity-70 text-sm">{isSignUp ? "Sign up to start tracking your finances" : "Sign in to your account to continue"}</p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm font-medium border border-red-500/20">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500 text-sm font-medium border border-emerald-500/20">
                {message}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5 opacity-80" htmlFor="email">Email Address</label>
              <input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" 
                className="w-full bg-[var(--color-background)] text-[var(--color-foreground)] border border-[var(--color-card-border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]/50 transition-all"
                required
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium opacity-80" htmlFor="password">Password</label>
                {!isSignUp && (
                  <a href="#" className="text-xs text-[var(--color-accent-primary)] hover:underline font-medium">Forgot?</a>
                )}
              </div>
              <input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-[var(--color-background)] text-[var(--color-foreground)] border border-[var(--color-card-border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]/50 transition-all"
                required
                minLength={6}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] text-white py-2.5 rounded-lg font-medium transition-colors mt-6 disabled:opacity-70"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : (
                <>
                  {isSignUp ? "Create Account" : "Sign In"} <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-card-border)]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[var(--color-card)] opacity-70">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button 
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 bg-[var(--color-background)] border border-[var(--color-card-border)] hover:bg-[var(--color-foreground)]/5 py-2.5 rounded-lg font-medium transition-colors text-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Continue with Google
              </button>
            </div>
          </div>
          
          <p className="mt-8 text-center text-sm opacity-70">
            {isSignUp ? "Already have an account?" : "Don't have an account?"} {' '}
            <button 
              type="button" 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[var(--color-accent-primary)] font-medium hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
