"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowRight, Loader2, Mail, ArrowLeft, Power } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
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
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfdfd] dark:bg-[#060812] relative overflow-hidden px-6">
        {/* Background decorative elements matching mockup */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          {/* Subtle top-right glow to simulate the sweeping curve in the dark mode mockup */}
          <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-indigo-500/10 dark:bg-indigo-600/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] left-[-20%] w-[60%] h-[60%] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full"></div>
        </div>

        <div className="absolute top-6 right-6 z-20">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-[340px] flex flex-col items-center z-10">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-6 pt-4">
            <img src="/logo-light.png" alt="Finacle Logo" className="w-72 md:w-80 h-auto object-contain dark:hidden" />
            <img src="/logo-dark.png" alt="Finacle Logo" className="w-72 md:w-80 h-auto object-contain hidden dark:block" />
          </div>

        {/* Dynamic Form Area */}
        {!showEmailForm ? (
          <div className="w-full space-y-4 animate-fade-in">
            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-transparent border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-900 dark:text-white py-4 rounded-[28px] font-semibold transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Continue with Google
            </button>
            
            <button 
              onClick={() => { setShowEmailForm(true); setIsSignUp(false); }}
              className="w-full flex items-center justify-center gap-3 bg-transparent border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-900 dark:text-white py-4 rounded-[28px] font-semibold transition-colors shadow-sm"
            >
              <Mail className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              Continue with Email
            </button>

            <div className="py-6 flex items-center justify-center w-full relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-[11px] font-semibold text-slate-400 dark:text-slate-500 tracking-widest px-4 bg-[#fdfdfd] dark:bg-[#060812]">
                OR
              </div>
            </div>

            <div className="text-center text-sm pb-8">
              <span className="text-slate-500 dark:text-slate-400">New to Finacle? </span>
              <button 
                onClick={() => { setShowEmailForm(true); setIsSignUp(true); }}
                className="text-[#10b981] font-medium hover:text-[#059669] transition-colors"
              >
                Create Account
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full animate-fade-in">
             <button 
               onClick={() => setShowEmailForm(false)}
               className="mb-6 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
             >
               <ArrowLeft size={16} /> Back
             </button>
             
             <div className="mb-6">
               <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{isSignUp ? "Create Account" : "Welcome Back"}</h2>
               <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{isSignUp ? "Enter your email to sign up" : "Enter your email to sign in"}</p>
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
                 <label htmlFor="email" className="sr-only">Email Address</label>
                 <input
                   id="email"
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="Email Address"
                   className="w-full bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-[20px] px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-sm"
                   required
                 />
               </div>

               <div>
                 <label htmlFor="password" className="sr-only">Password</label>
                 <input
                   id="password"
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="Password"
                   className="w-full bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-[20px] px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-sm"
                   required
                   minLength={6}
                 />
               </div>

               <button 
                 type="submit"
                 disabled={loading}
                 className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-[20px] font-semibold transition-colors mt-2 disabled:opacity-70 shadow-md shadow-indigo-500/20"
               >
                 {loading ? <Loader2 size={18} className="animate-spin" /> : (
                   <>
                     {isSignUp ? "Sign Up" : <><Power size={18} /> Sign In</>}
                   </>
                 )}
               </button>
             </form>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
