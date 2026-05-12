import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
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
            <div className="flex items-center gap-2 font-bold text-2xl tracking-tight text-[var(--color-foreground)]">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-primary)] flex items-center justify-center text-white">
                F
              </div>
              Finacle
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
            <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
            <p className="opacity-70 text-sm">Sign in to your account to continue</p>
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 opacity-80" htmlFor="email">Email Address</label>
              <input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                className="w-full bg-[var(--color-background)] border border-[var(--color-card-border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]/50 transition-all"
                required
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium opacity-80" htmlFor="password">Password</label>
                <a href="#" className="text-xs text-[var(--color-accent-primary)] hover:underline font-medium">Forgot?</a>
              </div>
              <input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-[var(--color-background)] border border-[var(--color-card-border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]/50 transition-all"
                required
              />
            </div>

            <Link href="/" className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] text-white py-2.5 rounded-lg font-medium transition-colors mt-6">
              Sign In <ArrowRight size={16} />
            </Link>
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

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 bg-[var(--color-background)] border border-[var(--color-card-border)] hover:bg-[var(--color-foreground)]/5 py-2.5 rounded-lg font-medium transition-colors text-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Google
              </button>
              <button className="flex items-center justify-center gap-2 bg-[var(--color-background)] border border-[var(--color-card-border)] hover:bg-[var(--color-foreground)]/5 py-2.5 rounded-lg font-medium transition-colors text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 9 18v4"></path>
                  <path d="M9 18c-4.51 2-5-2-7-2"></path>
                </svg>
                GitHub
              </button>
            </div>
          </div>
          
          <p className="mt-8 text-center text-sm opacity-70">
            Don't have an account? <a href="#" className="text-[var(--color-accent-primary)] font-medium hover:underline">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}
