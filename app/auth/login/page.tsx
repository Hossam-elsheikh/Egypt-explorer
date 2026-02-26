"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Compass, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success("Welcome back! 🎉");
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-egypt-hieroglyph">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&q=80')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-egypt-pattern opacity-20" />
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 rounded-2xl gradient-egypt flex items-center justify-center shadow-2xl mb-6">
            <Image src="/logo.png" alt="Egypt Explorer Logo" width={32} height={32} className="w-8 h-8 object-contain" unoptimized />
          </div>
          <h2 className="font-display text-4xl font-bold text-white mb-4">Egypt Explorer</h2>
          <p className="text-white/70 text-lg max-w-xs">
            Your gateway to discovering the wonders, flavors, and secrets of Egypt.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-xs">
            {["🏛️ Ancient Sites", "🥙 Local Food", "🏖️ Beaches", "🤿 Adventures"].map(item => (
              <div key={item} className="glass rounded-xl p-3 text-white text-sm font-medium text-left">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl gradient-egypt flex items-center justify-center">
              <Image src="/logo.png" alt="Egypt Explorer Logo" width={20} height={20} className="w-5 h-5 object-contain" unoptimized />
            </div>
            <span className="font-display font-bold text-xl text-foreground">Egypt Explorer</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-egypt-gold/50 focus:border-egypt-gold transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-egypt-gold hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-card border border-border rounded-xl pl-10 pr-10 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-egypt-gold/50 focus:border-egypt-gold transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-egypt text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 text-sm"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up" className="text-egypt-gold font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
