"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Compass, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("Auth");
  const supabase = createClient();

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success(t("loginSuccess"));
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-egypt-hieroglyph">
        {/* Layered Background Background */}
        <div
          className="absolute inset-0 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1572252017456-29111f18cbc6?w=1000&q=80')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.5) contrast(1.1)"
          }}
        />

        {/* Dynamic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-egypt-hieroglyph/95 via-egypt-hieroglyph/60 to-transparent" />
        <div className="absolute inset-0 bg-egypt-pattern opacity-10" />

        {/* Decorative Animated Blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-egypt-gold/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-egypt-nile/10 rounded-full blur-[150px]" />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center p-16 text-center w-full">
          {/* Main Logo Branding */}
          <div className="flex items-center gap-2 mb-8 animate-fade-in group">
            <span className="font-display font-bold text-6xl tracking-tighter text-egypt-gold text-shadow-lg">EGYPT</span>
            <span className="font-display font-bold text-6xl tracking-tighter text-white text-shadow-lg transition-transform group-hover:translate-x-1">Explorer</span>
          </div>

          <div className="max-w-md space-y-8">
            <div className="space-y-4">
              <h2 className="font-display text-4xl font-bold text-white leading-tight animate-fade-up">
                {t.rich("sideLoginTitle", { br: () => <br /> })}
              </h2>
              <p className="text-white/70 text-lg leading-relaxed animate-fade-up" style={{ animationDelay: "0.1s" }}>
                {t("sideLoginSubtitle")}
              </p>
            </div>

            {/* Premium Badges */}
            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <div className="glass-dark rounded-2xl p-4 text-left border border-white/5 hover:border-egypt-gold/30 transition-colors">
                <div className="text-2xl mb-1 text-egypt-gold font-bold">500+</div>
                <div className="text-xs text-white/60 uppercase tracking-widest font-semibold">{t("statVerifiedGems")}</div>
              </div>
              <div className="glass-dark rounded-2xl p-4 text-left border border-white/5 hover:border-egypt-gold/30 transition-colors">
                <div className="text-2xl mb-1 text-egypt-gold font-bold">4.9★</div>
                <div className="text-xs text-white/60 uppercase tracking-widest font-semibold">{t("statUserRating")}</div>
              </div>
              <div className="glass-dark rounded-2xl p-4 text-left border border-white/5 hover:border-egypt-gold/30 transition-colors">
                <div className="text-2xl mb-1 text-egypt-gold font-bold">100%</div>
                <div className="text-xs text-white/60 uppercase tracking-widest font-semibold">{t("statLocalContent")}</div>
              </div>
              <div className="glass-dark rounded-2xl p-4 text-left border border-white/5 hover:border-egypt-gold/30 transition-colors">
                <div className="text-2xl mb-1 text-egypt-gold font-bold">24/7</div>
                <div className="text-xs text-white/60 uppercase tracking-widest font-semibold">{t("statSupport")}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Attribution/Pill */}
        <div className="absolute bottom-10 left-16 right-16 flex justify-between items-center text-white/40 text-xs tracking-widest uppercase font-medium">
          <span>{t("sideLoginCities")}</span>
          <span>{t("sideCopyright")}</span>
        </div>
      </div>

      {/* Right - form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-1.5 mb-8 lg:hidden">
            <span className="font-display font-bold text-2xl tracking-tight text-egypt-gold">EGYPT</span>
            <span className="font-display font-bold text-2xl tracking-tight text-foreground">Explorer</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">{t("loginTitle")}</h1>
            <p className="text-muted-foreground">{t("loginSubtitle")}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                {t("emailLabel")}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t("emailPlaceholder")}
                  className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-egypt-gold/50 focus:border-egypt-gold transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-foreground">{t("passwordLabel")}</label>
                <Link href="/auth/forgot-password" prefetch={false} className="text-xs text-egypt-gold hover:underline">
                  {t("forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={t("passwordPlaceholder")}
                  className="w-full bg-card border border-border rounded-xl px-10 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-egypt-gold/50 focus:border-egypt-gold transition-all"
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
              {loading ? t("signingIn") : t("signInBtn")}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t("noAccount")}{" "}
            <Link href="/auth/sign-up" className="text-egypt-gold font-semibold hover:underline">
              {t("createOne")}
            </Link>
          </p>

          <div className="mt-12 pt-6 border-t border-border flex flex-wrap justify-center gap-6">
            {['en', 'de', 'fr', 'ru'].map((l) => (
              <button
                key={l}
                onClick={() => handleLocaleChange(l)}
                className={`text-xs font-bold uppercase tracking-widest transition-colors ${locale === l ? 'text-egypt-gold' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {l === 'en' ? 'English' : l === 'de' ? 'Deutsch' : l === 'fr' ? 'Français' : 'Русский'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
