"use client";

import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Profile } from "@/lib/types";
import { Menu, X, Search, MapPin, Heart, LogOut, User, Settings, ChevronDown, Compass, Landmark, Utensils, CupSoda, Sailboat, Hotel, Map } from "lucide-react";
import Image from "next/image";

export function Navbar() {
    const t = useTranslations("Navbar");

    const NAV_LINKS = [
        { href: "/explore/place", label: t("places"), icon: Landmark },
        { href: "/explore/food", label: t("food"), icon: Utensils },
        { href: "/explore/drink", label: t("drinks"), icon: CupSoda },
        { href: "/explore/activity", label: t("activities"), icon: Sailboat },
        { href: "/explore/hotel", label: t("hotels"), icon: Hotel },
        { href: "/explore/service", label: t("services"), icon: Map },
    ];

    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const isHome = pathname === "/";

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();
                setProfile(data);
            }
            setLoading(false);
        };
        fetchProfile();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            fetchProfile();
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    const navbarClass = `
    fixed top-0 left-0 right-0 z-50 transition-all duration-300
    ${scrolled || !isHome
            ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
            : "bg-transparent"
        }
  `;

    const linkClass = (href: string) => `
    relative text-sm font-medium transition-colors duration-200 py-1
    ${scrolled || !isHome ? "text-foreground hover:text-egypt-gold" : "text-white/90 hover:text-white"}
    ${pathname === href ? "text-egypt-gold" : ""}
  `;

    return (
        <nav className={navbarClass}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-1.5 group">
                        <span className="font-display font-bold text-2xl tracking-tight text-egypt-gold">EGYPT</span>
                        <span className={`font-display font-bold text-2xl tracking-tight transition-colors ${scrolled || !isHome ? "text-foreground" : "text-white"}`}>Explorer</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-1">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`${linkClass(link.href)} flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/10`}
                            >
                                <link.icon className="w-4 h-4 fill-current" />
                                <span>{link.label}</span>
                                {pathname === link.href && (
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-egypt-gold" />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        {/* Search */}
                        <Link
                            href="/search"
                            className={`p-2 rounded-lg transition-colors ${scrolled || !isHome ? "hover:bg-muted text-foreground" : "hover:bg-white/10 text-white"}`}
                        >
                            <Search className="w-5 h-5" />
                        </Link>

                        {/* Theme switcher */}
                        <ThemeSwitcher />

                        {/* Language switcher */}
                        <LanguageSwitcher />

                        {/* Auth */}
                        {!loading && (
                            <>
                                {profile ? (
                                    <div className="hidden lg:block relative">
                                        <button
                                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors ${scrolled || !isHome ? "hover:bg-muted" : "hover:bg-white/10"}`}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-egypt-gold flex items-center justify-center text-sm font-bold text-white">
                                                {profile.full_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || "?"}
                                            </div>
                                            <span className={`text-sm font-medium hidden xl:block ${scrolled || !isHome ? "text-foreground" : "text-white"}`}>
                                                {profile.full_name?.split(" ")[0] || "Account"}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 ${scrolled || !isHome ? "text-muted-foreground" : "text-white/70"}`} />
                                        </button>

                                        {userMenuOpen && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                                                <div className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
                                                    <div className="p-3 border-b border-border">
                                                        <p className="text-sm font-semibold text-foreground truncate">{profile.full_name || "User"}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                                                    </div>
                                                    <div className="p-1.5">
                                                        <Link href="/profile" onClick={() => setUserMenuOpen(false)}
                                                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-muted transition-colors w-full">
                                                            <User className="w-4 h-4 text-muted-foreground" />
                                                            My Profile
                                                        </Link>
                                                        <Link href="/favorites" onClick={() => setUserMenuOpen(false)}
                                                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-muted transition-colors w-full">
                                                            <Heart className="w-4 h-4 text-muted-foreground" />
                                                            Favorites
                                                        </Link>
                                                        <Link href="/suggest" onClick={() => setUserMenuOpen(false)}
                                                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-muted transition-colors w-full">
                                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                                            Suggest a Place
                                                        </Link>
                                                        {profile.role === "admin" && (
                                                            <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                                                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-muted transition-colors w-full">
                                                                <Settings className="w-4 h-4 text-muted-foreground" />
                                                                Admin Dashboard
                                                            </Link>
                                                        )}
                                                        <hr className="my-1 border-border" />
                                                        <button
                                                            onClick={() => { setUserMenuOpen(false); handleSignOut(); }}
                                                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-destructive/10 hover:text-destructive transition-colors w-full text-left"
                                                        >
                                                            <LogOut className="w-4 h-4" />
                                                            Sign Out
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="hidden lg:flex items-center gap-2">
                                        <Link
                                            href="/auth/login"
                                            className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors ${scrolled || !isHome ? "hover:bg-muted text-foreground" : "hover:bg-white/10 text-white"}`}
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            href="/auth/sign-up"
                                            className="text-sm font-semibold px-4 py-2 rounded-xl gradient-egypt text-white shadow-md hover:opacity-90 transition-opacity"
                                        >
                                            Join Free
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className={`lg:hidden p-2 rounded-lg transition-colors ${scrolled || !isHome ? "hover:bg-muted text-foreground" : "hover:bg-white/10 text-white"}`}
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="lg:hidden bg-background/98 backdrop-blur-xl border-b border-border">
                    <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                  ${pathname === link.href
                                        ? "bg-egypt-gold/10 text-egypt-gold"
                                        : "hover:bg-muted text-foreground"
                                    }`}
                            >
                                <link.icon className="w-5 h-5 fill-current opacity-80" />
                                {link.label}
                            </Link>
                        ))}
                        <div className="pt-2 border-t border-border mt-2 space-y-1">
                            {profile ? (
                                <>
                                    <div className="px-4 py-2 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-egypt-gold flex items-center justify-center text-sm font-bold text-white">
                                            {profile.full_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || "?"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground truncate">{profile.full_name || "User"}</p>
                                            <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/profile"
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                                    >
                                        <User className="w-5 h-5 text-muted-foreground" />
                                        My Profile
                                    </Link>
                                    <Link
                                        href="/favorites"
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                                    >
                                        <Heart className="w-5 h-5 text-muted-foreground" />
                                        Favorites
                                    </Link>
                                    {profile.role === "admin" && (
                                        <Link
                                            href="/admin"
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                                        >
                                            <Settings className="w-5 h-5 text-muted-foreground" />
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => { setMobileOpen(false); handleSignOut(); }}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-destructive/10 hover:text-destructive transition-colors w-full text-left"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-2 px-2 py-2">
                                    <Link
                                        href="/auth/login"
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/auth/sign-up"
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold gradient-egypt text-white shadow-md hover:opacity-90 transition-opacity"
                                    >
                                        Join Free
                                    </Link>
                                </div>
                            )}
                            <Link
                                href="/suggest"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted"
                            >
                                <MapPin className="w-5 h-5 text-egypt-gold" />
                                Suggest a Place
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
