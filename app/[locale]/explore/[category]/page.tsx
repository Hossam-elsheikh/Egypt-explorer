"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ItemCard, ItemCardSkeleton } from "@/components/explore/item-card";
import { Item, Location, Category, CATEGORY_ICONS, CATEGORY_LABELS, PriceRange, PRICE_RANGE_LABELS } from "@/lib/types";
import { SlidersHorizontal, X, ChevronDown, Search } from "lucide-react";

const SORT_OPTIONS = [
    { value: "average_rating", label: "Top Rated" },
    { value: "total_views", label: "Most Popular" },
    { value: "created_at", label: "Newest First" },
    { value: "min_price", label: "Price: Low to High" },
];

const PRICE_RANGES: PriceRange[] = ["budget", "moderate", "expensive", "luxury"];

interface ExplorePageProps {
    params: Promise<{ category: string }>;
    searchParams: Promise<{ location?: string; featured?: string; price?: string }>;
}

export default function ExplorePage({ params, searchParams }: ExplorePageProps) {
    const { category } = use(params);
    const sp = use(searchParams);

    const [items, setItems] = useState<Item[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    // Filters
    const [searchText, setSearchText] = useState("");
    const [selectedLocation, setSelectedLocation] = useState(sp.location || "");
    const [selectedPrice, setSelectedPrice] = useState<PriceRange | "">(sp.price as PriceRange || "");
    const [sortBy, setSortBy] = useState("average_rating");
    const [minRating, setMinRating] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 12;

    const supabase = createClient();

    // Normalize category param to match DB enum
    const categorySlug = category as Category;

    useEffect(() => {
        supabase
            .from("locations")
            .select("*")
            .order("name")
            .then(({ data }) => setLocations(data || []));
    }, []);

    useEffect(() => {
        setPage(1);
        fetchItems(1);
    }, [category, selectedLocation, selectedPrice, sortBy, minRating, searchText]);

    const fetchItems = async (pageNum: number) => {
        setLoading(true);
        let query = supabase
            .from("items")
            .select("*, location:locations(*)", { count: "exact" })
            .eq("status", "active")
            .eq("category", categorySlug)
            .order(sortBy, { ascending: sortBy === "min_price" });

        if (sp.featured === "true") {
            query = query.eq("is_featured", true);
        }
        if (selectedLocation) {
            // Filter by location name
            const loc = locations.find(
                (l) => l.name.toLowerCase() === selectedLocation.toLowerCase() ||
                    l.governorate.toLowerCase() === selectedLocation.toLowerCase()
            );
            if (loc) query = query.eq("location_id", loc.id);
        }
        if (selectedPrice) {
            query = query.eq("price_range", selectedPrice);
        }
        if (minRating > 0) {
            query = query.gte("average_rating", minRating);
        }
        if (searchText) {
            query = query.ilike("title", `%${searchText}%`);
        }

        const from = (pageNum - 1) * PAGE_SIZE;
        query = query.range(from, from + PAGE_SIZE - 1);

        const { data, count } = await query;
        setItems((data as Item[]) || []);
        setTotalCount(count || 0);
        setLoading(false);
    };

    const clearFilters = () => {
        setSelectedLocation("");
        setSelectedPrice("");
        setMinRating(0);
        setSearchText("");
        setSortBy("average_rating");
    };

    const hasFilters = selectedLocation || selectedPrice || minRating > 0 || searchText;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const categoryLabel = CATEGORY_LABELS[categorySlug] || category;
    const categoryIcon = CATEGORY_ICONS[categorySlug] || "📍";

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-background">
                {/* Header */}
                <div className="bg-gradient-to-br from-egypt-hieroglyph to-egypt-nile pt-24 pb-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center text-4xl shadow-xl">
                                {categoryIcon}
                            </div>
                            <div>
                                <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
                                    {categoryLabel} in Egypt
                                </h1>
                                <p className="text-white/70 mt-1">
                                    {loading ? "Loading..." : `${totalCount.toLocaleString()} results found`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Filter bar */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-8">
                        {/* Search */}
                        <div className="flex-1 flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5">
                            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <input
                                type="text"
                                placeholder={`Search ${categoryLabel}...`}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder-muted-foreground"
                            />
                        </div>

                        {/* Sort */}
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground pr-8 outline-none cursor-pointer"
                            >
                                {SORT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>

                        {/* Filter toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${showFilters ? "bg-egypt-gold text-white" : "bg-card border border-border text-foreground hover:bg-muted"}`}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filters
                            {hasFilters && (
                                <span className="w-2 h-2 rounded-full bg-white/80" />
                            )}
                        </button>
                    </div>

                    {/* Expanded filters */}
                    {showFilters && (
                        <div className="bg-card border border-border rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Location */}
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                                    Location
                                </label>
                                <select
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none"
                                >
                                    <option value="">All Locations</option>
                                    {locations.map((loc) => (
                                        <option key={loc.id} value={loc.name}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Price range */}
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                                    Price Range
                                </label>
                                <select
                                    value={selectedPrice}
                                    onChange={(e) => setSelectedPrice(e.target.value as PriceRange | "")}
                                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none"
                                >
                                    <option value="">Any Price</option>
                                    {PRICE_RANGES.map((pr) => (
                                        <option key={pr} value={pr}>{PRICE_RANGE_LABELS[pr]}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Min rating */}
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                                    Min Rating: {minRating > 0 ? `${minRating}★` : "Any"}
                                </label>
                                <div className="flex gap-2">
                                    {[0, 3, 3.5, 4, 4.5].map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setMinRating(r)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${minRating === r ? "bg-egypt-gold text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                                        >
                                            {r === 0 ? "Any" : `${r}+`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {hasFilters && (
                                <div className="sm:col-span-3 flex justify-end">
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        Clear all filters
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Active filter pills */}
                    {hasFilters && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {selectedLocation && (
                                <span className="flex items-center gap-1.5 text-xs bg-egypt-gold/10 text-egypt-gold border border-egypt-gold/30 px-3 py-1 rounded-full font-medium">
                                    📍 {selectedLocation}
                                    <button onClick={() => setSelectedLocation("")}><X className="w-3 h-3" /></button>
                                </span>
                            )}
                            {selectedPrice && (
                                <span className="flex items-center gap-1.5 text-xs bg-egypt-gold/10 text-egypt-gold border border-egypt-gold/30 px-3 py-1 rounded-full font-medium">
                                    💰 {PRICE_RANGE_LABELS[selectedPrice]}
                                    <button onClick={() => setSelectedPrice("")}><X className="w-3 h-3" /></button>
                                </span>
                            )}
                            {minRating > 0 && (
                                <span className="flex items-center gap-1.5 text-xs bg-egypt-gold/10 text-egypt-gold border border-egypt-gold/30 px-3 py-1 rounded-full font-medium">
                                    ⭐ {minRating}+ stars
                                    <button onClick={() => setMinRating(0)}><X className="w-3 h-3" /></button>
                                </span>
                            )}
                        </div>
                    )}

                    {/* Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading
                            ? Array.from({ length: PAGE_SIZE }).map((_, i) => <ItemCardSkeleton key={i} />)
                            : items.length > 0
                                ? items.map((item) => <ItemCard key={item.id} item={item} />)
                                : (
                                    <div className="col-span-full text-center py-20">
                                        <div className="text-6xl mb-4">{categoryIcon}</div>
                                        <h3 className="font-display text-xl font-bold text-foreground mb-2">
                                            No {categoryLabel} Found
                                        </h3>
                                        <p className="text-muted-foreground text-sm mb-6">
                                            {hasFilters
                                                ? "Try adjusting your filters to see more results."
                                                : "No items in this category yet. Check back soon!"}
                                        </p>
                                        {hasFilters && (
                                            <button
                                                onClick={clearFilters}
                                                className="gradient-egypt text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90"
                                            >
                                                Clear Filters
                                            </button>
                                        )}
                                    </div>
                                )
                        }
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-12">
                            <button
                                onClick={() => { setPage(p => p - 1); fetchItems(page - 1); }}
                                disabled={page === 1}
                                className="px-4 py-2 rounded-xl border border-border text-sm font-medium disabled:opacity-40 hover:bg-muted transition-colors"
                            >
                                ← Previous
                            </button>
                            <span className="text-sm text-muted-foreground px-4">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => { setPage(p => p + 1); fetchItems(page + 1); }}
                                disabled={page === totalPages}
                                className="px-4 py-2 rounded-xl border border-border text-sm font-medium disabled:opacity-40 hover:bg-muted transition-colors"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
