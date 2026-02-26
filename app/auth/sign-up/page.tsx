"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Compass, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success("Account created! Check your email to confirm.");
      router.push("/auth/sign-up-success");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-egypt-hieroglyph">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80')`,
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
          <h2 className="font-display text-4xl font-bold text-white mb-4">Join Egypt Explorer</h2>
          <p className="text-white/70 text-lg max-w-xs">
            Create your free account and start saving your favorite places, leaving reviews, and more.
          </p>
          <div className="mt-12 space-y-3 w-full max-w-xs">
            {[
              "❤️ Save favorited places",
              "💬 Leave reviews & ratings",
              "💡 Suggest new places",
              "🗺️ Personalized suggestions",
            ].map(item => (
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
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Create your account</h1>
            <p className="text-muted-foreground">Start exploring Egypt for free</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Your full name"
                  className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-egypt-gold/50 focus:border-egypt-gold transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Email address</label>
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
              <label className="text-sm font-medium text-foreground block mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
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
              {loading ? "Creating account..." : "Create Free Account"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-egypt-gold font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
