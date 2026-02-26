"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ItemCard, ItemCardSkeleton } from "@/components/item-card";
import { Item } from "@/lib/types";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchFavorites = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/auth/login");
                return;
            }

            const { data } = await supabase
                .from("favorites")
                .select("*, item:items(*, location:locations(*))")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            const items = (data || []).map((f: any) => ({ ...f.item, is_favorite: true }));
            setFavorites(items as Item[]);
            setLoading(false);
        };
        fetchFavorites();
    }, []);

    const handleFavoriteChange = (itemId: string, isFavorite: boolean) => {
        if (!isFavorite) {
            setFavorites(prev => prev.filter(f => f.id !== itemId));
        }
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-background">
                {/* Header */}
                <div className="bg-gradient-to-br from-rose-600 to-pink-600 pt-24 pb-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                                <Heart className="w-7 h-7 text-white fill-white" />
                            </div>
                            <div>
                                <h1 className="font-display text-3xl font-bold text-white">My Favorites</h1>
                                <p className="text-white/70 mt-1">
                                    {loading ? "Loading..." : `${favorites.length} saved places`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => <ItemCardSkeleton key={i} />)}
                        </div>
                    ) : favorites.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {favorites.map(item => (
                                <ItemCard key={item.id} item={item} onFavoriteChange={handleFavoriteChange} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24">
                            <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-5" />
                            <h2 className="font-display text-2xl font-bold text-foreground mb-3">No favorites yet</h2>
                            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                                Start exploring Egypt and save the places, food, and services you love.
                            </p>
                            <Link
                                href="/"
                                className="gradient-egypt text-white font-semibold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                            >
                                🔍 Start Exploring
                            </Link>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
