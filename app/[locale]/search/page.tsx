"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ItemCard, ItemCardSkeleton } from "@/components/explore/item-card";
import { Item, Category, CATEGORY_ICONS, CATEGORY_LABELS } from "@/lib/types";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

const CATEGORIES: Category[] = ["place", "restaurant", "food", "drink", "activity", "hotel", "service"];

interface SearchPageProps {
    searchParams: Promise<{ q?: string; location?: string; sort?: string }>;
}

export default function SearchPage({ searchParams }: SearchPageProps) {
    const sp = use(searchParams);
    const router = useRouter();
    const [query, setQuery] = useState(sp.q || "");
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | "">("");
    const [totalCount, setTotalCount] = useState(0);

    const supabase = createClient();

    useEffect(() => {
        if (sp.q || sp.location) {
            runSearch();
        }
    }, [sp.q, sp.location, selectedCategory]);

    const runSearch = async (q = sp.q || query, location = sp.location) => {
        setLoading(true);

        let dbQuery = supabase
            .from("items")
            .select("*, location:locations(*)", { count: "exact" })
            .eq("status", "active");

        if (q) {
            dbQuery = dbQuery.or(`title.ilike.%${q}%,description.ilike.%${q}%,tags.cs.{${q}}`);
        }
        if (location) {
            // search in joined location name
            dbQuery = dbQuery.ilike("location.name", `%${location}%`);
        }
        if (selectedCategory) {
            dbQuery = dbQuery.eq("category", selectedCategory);
        }

        if (sp.sort === "trending") {
            dbQuery = dbQuery.order("total_views", { ascending: false });
        } else {
            dbQuery = dbQuery.order("average_rating", { ascending: false });
        }

        dbQuery = dbQuery.limit(24);

        const { data, count } = await dbQuery;
        setItems((data as Item[]) || []);
        setTotalCount(count || 0);
        setLoading(false);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-background">
                {/* Header */}
                <div className="bg-gradient-to-br from-egypt-hieroglyph to-egypt-nile pt-24 pb-12">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6">
                        <h1 className="font-display text-3xl font-bold text-white mb-6 text-center">
                            Search Egypt Explorer
                        </h1>
                        <form onSubmit={handleSearch}>
                            <div className="flex glass rounded-2xl overflow-hidden p-1.5 shadow-2xl">
                                <div className="flex items-center gap-2 px-4 flex-1">
                                    <Search className="w-5 h-5 text-white/60 flex-shrink-0" />
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search places, food, activities..."
                                        className="flex-1 bg-transparent text-white placeholder-white/50 outline-none text-base"
                                        autoFocus
                                    />
                                    {query && (
                                        <button type="button" onClick={() => setQuery("")}>
                                            <X className="w-4 h-4 text-white/50 hover:text-white" />
                                        </button>
                                    )}
                                </div>
                                <button type="submit" className="gradient-egypt text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
                                    Search
                                </button>
                            </div>
                        </form>

                        {/* Category filters */}
                        <div className="flex flex-wrap gap-2 mt-4 justify-center">
                            <button
                                onClick={() => setSelectedCategory("")}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${!selectedCategory ? "bg-egypt-gold text-white" : "glass text-white/80 hover:text-white"}`}
                            >
                                All
                            </button>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${selectedCategory === cat ? "bg-egypt-gold text-white" : "glass text-white/80 hover:text-white"}`}
                                >
                                    {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {(sp.q || sp.location) && (
                        <p className="text-muted-foreground text-sm mb-6">
                            {loading ? "Searching..." : `${totalCount} results for "${sp.q || sp.location}"`}
                        </p>
                    )}

                    {!(sp.q || sp.location) && !loading && (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🔍</div>
                            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Start Exploring</h2>
                            <p className="text-muted-foreground">Type something above to search across all of Egypt&apos;s places, food, and services.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading
                            ? Array.from({ length: 6 }).map((_, i) => <ItemCardSkeleton key={i} />)
                            : items.map(item => <ItemCard key={item.id} item={item} />)
                        }
                    </div>

                    {!loading && (sp.q || sp.location) && items.length === 0 && (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">😅</div>
                            <h2 className="font-display text-2xl font-bold text-foreground mb-2">No Results Found</h2>
                            <p className="text-muted-foreground mb-4">Try a different search term or browse by category.</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {CATEGORIES.map(cat => (
                                    <a key={cat} href={`/explore/${cat}`} className="text-sm px-4 py-2 bg-muted rounded-xl hover:bg-muted/80 text-foreground transition-colors">
                                        {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
