"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useRouter } from "@/i18n/routing";
import { ItemCard, ItemCardSkeleton } from "@/components/item-card";
import { Item, CATEGORY_ICONS, CATEGORY_LABELS, Category } from "@/lib/types";
import { ChevronRight, Search, MapPin, Star, Compass, Camera, Lightbulb, Landmark } from "lucide-react";
import Image from "next/image";

const HERO_STATS = [
  { value: "500+", label: "Verified Places" },
  { value: "50+", label: "Categories" },
  { value: "27", label: "Governorates" },
  { value: "4.8★", label: "Avg Rating" },
];

const EXPLORE_CATEGORIES: { category: Category; description: string }[] = [
  { category: "place", description: "Ancient temples, pyramids & monuments" },
  { category: "restaurant", description: "Authentic Egyptian dining experiences" },
  { category: "food", description: "Street food & local specialties" },
  { category: "drink", description: "Traditional drinks & modern cafes" },
  { category: "activity", description: "Nile cruises, safaris & more" },
  { category: "hotel", description: "Luxury resorts to budget stays" },
  { category: "service", description: "Tours, guides & travel services" },
];

const EGYPT_HIGHLIGHTS = [
  {
    title: "Ancient Wonders",
    description: "Explore 7,000 years of civilization",
    image: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&q=80",
    color: "from-amber-500/10 to-transparent",
  },
  {
    title: "Vibrant Cuisine",
    description: "From koshary to fresh shawarma",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
    color: "from-red-500/10 to-transparent",
  },
  {
    title: "Red Sea Bliss",
    description: "World-class diving & beaches",
    image: "https://images.unsplash.com/photo-1544216717-3bbf52512659?w=800&q=80",
    color: "from-cyan-500/10 to-transparent",
  },
  {
    title: "Desert Magic",
    description: "Sahara safaris & stargazing",
    image: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&q=80",
    color: "from-yellow-500/10 to-transparent",
  },
];

export default function RootPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [featured, setFeatured] = useState<Item[]>([]);
  const [trending, setTrending] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const [featuredRes, trendingRes] = await Promise.all([
        supabase
          .from("items")
          .select("*, location:locations(*)")
          .eq("status", "active")
          .eq("is_featured", true)
          .order("average_rating", { ascending: false })
          .limit(6),
        supabase
          .from("items")
          .select("*, location:locations(*)")
          .eq("status", "active")
          .order("total_views", { ascending: false })
          .limit(6),
      ]);
      setFeatured((featuredRes.data as Item[]) || []);
      setTrending((trendingRes.data as Item[]) || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <Navbar />
      <main>
        {/* ═══ HERO ═══════════════════════════════════════════════ */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-egypt-hieroglyph" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1539768942893-daf53e448371?w=1600&q=80')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 gradient-hero" />
          <div className="absolute inset-0 bg-egypt-pattern opacity-20" />

          <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 mt-20">
          

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 text-shadow leading-tight animate-fade-up">
              Discover the Magic
              <br />
              <span className="text-egypt-gold">of Egypt</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Find the best places, authentic food, hidden gems, and essential services
              with real ratings and prices from fellow travelers.
            </p>

            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <div className="flex glass rounded-2xl overflow-hidden p-1.5 shadow-2xl">
                <div className="flex items-center gap-2 px-4 flex-1">
                  <Search className="w-5 h-5 text-white/60 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search places, food, restaurants..."
                    className="flex-1 bg-transparent text-white placeholder-white/50 outline-none text-base"
                  />
                </div>
                <button
                  type="submit"
                  className="gradient-egypt text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Explore</span>
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-2 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              {(["place", "food", "drink", "activity"] as Category[]).map((cat) => (
                <Link
                  key={cat}
                  href={`/explore/${cat}`}
                  className="glass text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-egypt-gold/20 transition-colors"
                >
                  {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 animate-fade-up" style={{ animationDelay: "0.4s" }}>
              {HERO_STATS.map((stat) => (
                <div key={stat.label} className="glass rounded-2xl p-4">
                  <div className="text-2xl font-bold text-egypt-gold font-display">{stat.value}</div>
                  <div className="text-white/70 text-xs mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5">
              <div className="w-1 h-2 bg-white/60 rounded-full" />
            </div>
          </div>
        </section>

        {/* ═══ HIGHLIGHTS ════════════════════════════════════════ */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
                Why Explore Egypt?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                A land of contrasts — where ancient history meets vibrant modern culture
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {EGYPT_HIGHLIGHTS.map((h) => (
                <div key={h.title} className="group relative h-96 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500">
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <Image
                      src={h.image}
                      alt={h.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${h.color} opacity-30`} />
                  </div>

                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 p-8 transform transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
                    <h3 className="font-display font-bold text-white text-2xl mb-2 text-shadow">
                      {h.title}
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      {h.description}
                    </p>
                    <div className="mt-4 w-10 h-1 bg-egypt-gold rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ BROWSE CATEGORIES ══════════════════════════════════ */}
        <section className="py-20 bg-egypt-papyrus/60 dark:bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                Browse by Category
              </h2>
              <p className="text-muted-foreground mt-2">Everything you need for the perfect Egypt trip</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              {EXPLORE_CATEGORIES.map(({ category, description }) => (
                <Link
                  key={category}
                  href={`/explore/${category}`}
                  className="group flex flex-col items-center p-5 bg-card border border-border rounded-2xl hover:border-egypt-gold hover:shadow-lg transition-all duration-300 text-center"
                >
                  <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">
                    {CATEGORY_ICONS[category]}
                  </div>
                  <span className="font-semibold text-foreground text-sm group-hover:text-egypt-gold transition-colors">
                    {CATEGORY_LABELS[category]}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1 leading-tight hidden sm:block">
                    {description}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FEATURED ═══════════════════════════════════════════ */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 text-egypt-gold text-sm font-semibold mb-2">
                  <Star className="w-4 h-4 fill-current" />
                  Editor&apos;s Picks
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">Featured in Egypt</h2>
              </div>
              <Link href="/explore/place?featured=true" className="text-sm font-medium text-egypt-gold hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <ItemCardSkeleton key={i} />)
                : featured.length > 0
                  ? featured.map((item) => <ItemCard key={item.id} item={item} />)
                  : (
                    <div className="col-span-full text-center py-16 text-muted-foreground">
                      <Camera className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium mb-2">No featured items yet</p>
                      <p className="text-sm">Use the Admin Dashboard to add and feature content.</p>
                    </div>
                  )
              }
            </div>
          </div>
        </section>

        {/* ═══ TRENDING ═══════════════════════════════════════════ */}
        {!loading && trending.length > 0 && (
          <section className="py-20 bg-egypt-papyrus/60 dark:bg-muted/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <div className="flex items-center gap-2 text-egypt-gold text-sm font-semibold mb-2">
                    <Landmark className="w-4 h-4" />
                    Most Visited
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">Trending Now</h2>
                </div>
                <Link href="/search?sort=trending" className="text-sm font-medium text-egypt-gold hover:underline flex items-center gap-1">
                  See all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {trending.map((item) => <ItemCard key={item.id} item={item} />)}
              </div>
            </div>
          </section>
        )}

        {/* ═══ DESTINATIONS ════════════════════════════════════════ */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 text-egypt-gold text-sm font-semibold mb-2">
                <MapPin className="w-4 h-4" />
                Top Destinations
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                Explore by Location
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Cairo", desc: "The eternal capital", emoji: "🏙️", color: "from-orange-500 to-amber-500" },
                { name: "Luxor", desc: "Valley of the Kings", emoji: "🏛️", color: "from-yellow-500 to-orange-500" },
                { name: "Hurghada", desc: "Red Sea paradise", emoji: "🏖️", color: "from-cyan-500 to-blue-500" },
                { name: "Aswan", desc: "Nubian charm", emoji: "⛵", color: "from-purple-500 to-pink-500" },
                { name: "Alexandria", desc: "Mediterranean gem", emoji: "🌊", color: "from-blue-500 to-indigo-500" },
                { name: "Sharm El-Sheikh", desc: "Sinai diving hub", emoji: "🤿", color: "from-teal-500 to-cyan-500" },
                { name: "Dahab", desc: "Hippie paradise", emoji: "🌅", color: "from-rose-500 to-pink-500" },
                { name: "Siwa Oasis", desc: "Desert wonder", emoji: "🌴", color: "from-emerald-500 to-green-500" },
              ].map((dest) => (
                <Link
                  key={dest.name}
                  href={`/search?location=${encodeURIComponent(dest.name)}`}
                  className="group relative rounded-2xl overflow-hidden bg-card border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${dest.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                  <div className="relative p-5">
                    <div className="text-3xl mb-3">{dest.emoji}</div>
                    <h3 className="font-display font-bold text-foreground group-hover:text-egypt-gold transition-colors">
                      {dest.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{dest.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ SUGGEST CTA ════════════════════════════════════════ */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-br from-egypt-hieroglyph to-egypt-nile rounded-3xl p-10 sm:p-16 relative overflow-hidden">
              <div className="absolute inset-0 bg-egypt-pattern opacity-10" />
              <div className="relative z-10">
                <div className="text-5xl mb-5">💡</div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
                  Know a Hidden Gem?
                </h2>
                <p className="text-white/75 text-lg mb-8 max-w-md mx-auto">
                  Help fellow travelers discover Egypt&apos;s best-kept secrets.
                  Suggest a place and our team will review it.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/suggest"
                    className="gradient-egypt text-white font-semibold px-8 py-4 rounded-2xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Lightbulb className="w-5 h-5" />
                    Suggest a Place
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    className="glass text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                  >
                    Join the Community
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
