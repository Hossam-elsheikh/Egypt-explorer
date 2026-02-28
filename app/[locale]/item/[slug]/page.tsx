"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Item, Comment, CATEGORY_ICONS, PRICE_RANGE_LABELS } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { Star, MapPin, Phone, Globe, Clock, DollarSign, Heart, ChevronLeft, Send, Flag, ExternalLink, Share2, Eye } from "lucide-react";

interface ItemDetailProps {
    params: Promise<{ slug: string }>;
}

export default function ItemDetailPage({ params }: ItemDetailProps) {
    const { slug } = use(params);
    const [item, setItem] = useState<Item | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState(0);

    const supabase = createClient();

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id || null);

            // Fetch item
            const { data: itemData } = await supabase
                .from("items")
                .select("*, location:locations(*)")
                .eq("slug", slug)
                .single();

            if (itemData) {
                setItem(itemData as Item);

                // Increment view count
                try { await supabase.rpc("increment_item_views", { item_id: itemData.id }); } catch { /* ignore */ }

                // Fetch comments
                const { data: commentsData } = await supabase
                    .from("comments")
                    .select("*, profile:profiles(full_name, avatar_url)")
                    .eq("item_id", itemData.id)
                    .eq("is_approved", true)
                    .order("created_at", { ascending: false });
                setComments((commentsData as Comment[]) || []);

                // Check favorite & user rating
                if (user) {
                    const [favRes, ratingRes] = await Promise.all([
                        supabase.from("favorites").select("id").eq("user_id", user.id).eq("item_id", itemData.id).single(),
                        supabase.from("ratings").select("rating").eq("user_id", user.id).eq("item_id", itemData.id).single(),
                    ]);
                    setIsFavorite(!!favRes.data);
                    if (ratingRes.data) setUserRating(ratingRes.data.rating);
                }
            }
            setLoading(false);
        };
        init();
    }, [slug]);

    const handleRating = async (rating: number) => {
        if (!userId) { toast.error("Please sign in to rate"); return; }
        if (!item) return;

        const { error } = await supabase
            .from("ratings")
            .upsert({ item_id: item.id, user_id: userId, rating }, { onConflict: "item_id,user_id" });

        if (!error) {
            setUserRating(rating);
            toast.success(`You rated ${rating} ⭐`);
            // Refresh avg rating
            const { data } = await supabase
                .from("items")
                .select("average_rating, total_ratings")
                .eq("id", item.id)
                .single();
            if (data) setItem(prev => prev ? { ...prev, ...data } : prev);
        }
    };

    const handleFavorite = async () => {
        if (!userId) { toast.error("Please sign in to save favorites"); return; }
        if (!item) return;

        if (isFavorite) {
            await supabase.from("favorites").delete().eq("user_id", userId).eq("item_id", item.id);
            setIsFavorite(false);
            toast.success("Removed from favorites");
        } else {
            await supabase.from("favorites").insert({ user_id: userId, item_id: item.id });
            setIsFavorite(true);
            toast.success("Saved to favorites ❤️");
        }
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) { toast.error("Please sign in to comment"); return; }
        if (!commentText.trim() || !item) return;
        setCommentLoading(true);

        const { data, error } = await supabase
            .from("comments")
            .insert({ item_id: item.id, user_id: userId, content: commentText.trim() })
            .select("*, profile:profiles(full_name, avatar_url)")
            .single();

        if (!error && data) {
            setComments(prev => [data as Comment, ...prev]);
            setCommentText("");
            toast.success("Comment posted!");
        } else {
            toast.error("Failed to post comment");
        }
        setCommentLoading(false);
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen bg-background pt-20">
                    <div className="max-w-5xl mx-auto px-4 py-12">
                        <div className="space-y-6">
                            <div className="aspect-video shimmer rounded-2xl" />
                            <div className="h-8 shimmer rounded-full w-3/4" />
                            <div className="h-4 shimmer rounded-full w-1/2" />
                            <div className="grid grid-cols-3 gap-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-20 shimmer rounded-xl" />)}
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    if (!item) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen bg-background flex items-center justify-center pt-16">
                    <div className="text-center">
                        <div className="text-6xl mb-4">🔍</div>
                        <h1 className="font-display text-2xl font-bold mb-2">Item Not Found</h1>
                        <p className="text-muted-foreground mb-6">This item doesn&apos;t exist or has been removed.</p>
                        <Link href="/" className="gradient-egypt text-white px-6 py-3 rounded-xl font-medium hover:opacity-90">
                            Back to Home
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    const allImages = [item.image_url, ...(item.gallery_urls || [])].filter(Boolean) as string[];
    const openingHours = item.opening_hours as Record<string, string> | null;

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-background pt-16">
                {/* Breadcrumb */}
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-egypt-gold transition-colors">Home</Link>
                        <span>/</span>
                        <Link href={`/explore/${item.category}`} className="hover:text-egypt-gold transition-colors capitalize">
                            {item.category}s
                        </Link>
                        <span>/</span>
                        <span className="text-foreground font-medium truncate">{item.title}</span>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 pb-16">
                    {/* Image gallery */}
                    {allImages.length > 0 && (
                        <div className="mb-8">
                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted mb-3">
                                <Image
                                    src={allImages[activeImage]}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                {/* Category badge */}
                                <div className="absolute top-4 left-4 glass text-white text-sm font-semibold px-3 py-1.5 rounded-full">
                                    {CATEGORY_ICONS[item.category]} {item.category}
                                </div>
                                {/* Views */}
                                <div className="absolute top-4 right-4 glass text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                    <Eye className="w-4 h-4" />
                                    {item.total_views.toLocaleString()} views
                                </div>
                            </div>
                            {allImages.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {allImages.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImage(i)}
                                            className={`relative flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${i === activeImage ? "border-egypt-gold" : "border-transparent opacity-70 hover:opacity-100"}`}
                                        >
                                            <Image src={img} alt="" fill className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Title & actions */}
                            <div>
                                {item.is_featured && (
                                    <span className="inline-flex items-center gap-1 text-egypt-gold text-xs font-bold mb-2">
                                        <Star className="w-3.5 h-3.5 fill-current" /> Featured
                                    </span>
                                )}
                                <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
                                    {item.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-4">
                                    {/* Rating display */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star key={s} className={`w-5 h-5 ${s <= Math.round(item.average_rating) ? "fill-egypt-gold text-egypt-gold" : "text-muted-foreground/30"}`} />
                                            ))}
                                        </div>
                                        <span className="font-bold text-foreground">
                                            {item.average_rating > 0 ? item.average_rating.toFixed(1) : "New"}
                                        </span>
                                        <span className="text-muted-foreground text-sm">({item.total_ratings} ratings)</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 ml-auto">
                                        <button onClick={handleFavorite}
                                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isFavorite ? "bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400" : "bg-muted hover:bg-muted/80 text-foreground"}`}>
                                            <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                                            {isFavorite ? "Saved" : "Save"}
                                        </button>
                                        <button onClick={handleShare}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors">
                                            <Share2 className="w-4 h-4" />
                                            Share
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {item.description && (
                                <div>
                                    <h2 className="font-display font-semibold text-xl text-foreground mb-3">About</h2>
                                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                                </div>
                            )}

                            {/* Tags */}
                            {item.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {item.tags.map(tag => (
                                        <span key={tag} className="text-sm px-3 py-1 bg-muted rounded-full text-muted-foreground">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Opening Hours */}
                            {openingHours && Object.keys(openingHours).length > 0 && (
                                <div>
                                    <h2 className="font-display font-semibold text-xl text-foreground mb-3 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-egypt-gold" /> Opening Hours
                                    </h2>
                                    <div className="bg-card border border-border rounded-xl p-4 space-y-2">
                                        {Object.entries(openingHours).map(([day, hours]) => (
                                            <div key={day} className="flex justify-between text-sm">
                                                <span className="font-medium capitalize text-foreground">{day}</span>
                                                <span className="text-muted-foreground">{hours}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Rate this item */}
                            <div className="bg-card border border-border rounded-2xl p-6">
                                <h2 className="font-display font-semibold text-xl text-foreground mb-4">Rate This Place</h2>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <button key={s}
                                                onMouseEnter={() => setHoverRating(s)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => handleRating(s)}
                                                className="transition-transform hover:scale-125"
                                            >
                                                <Star className={`w-8 h-8 ${s <= (hoverRating || userRating) ? "fill-egypt-gold text-egypt-gold" : "text-muted-foreground/30"}`} />
                                            </button>
                                        ))}
                                    </div>
                                    {userRating > 0 && (
                                        <span className="text-sm text-muted-foreground">Your rating: {userRating}★</span>
                                    )}
                                </div>
                                {!userId && (
                                    <p className="text-sm text-muted-foreground">
                                        <Link href="/auth/login" className="text-egypt-gold hover:underline">Sign in</Link> to rate this place
                                    </p>
                                )}
                            </div>

                            {/* Comments */}
                            <div>
                                <h2 className="font-display font-semibold text-xl text-foreground mb-5">
                                    Reviews ({comments.length})
                                </h2>

                                {/* Add comment */}
                                {userId ? (
                                    <form onSubmit={handleComment} className="mb-6">
                                        <textarea
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            placeholder="Share your experience..."
                                            rows={3}
                                            className="w-full bg-card border border-border rounded-xl p-4 text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-egypt-gold/50 resize-none"
                                        />
                                        <div className="flex justify-end mt-2">
                                            <button
                                                type="submit"
                                                disabled={!commentText.trim() || commentLoading}
                                                className="gradient-egypt text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                                            >
                                                <Send className="w-4 h-4" />
                                                {commentLoading ? "Posting..." : "Post Review"}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="bg-muted rounded-xl p-4 mb-6 text-sm text-center text-muted-foreground">
                                        <Link href="/auth/login" className="text-egypt-gold hover:underline font-medium">Sign in</Link> to leave a review
                                    </div>
                                )}

                                {/* Comments list */}
                                <div className="space-y-4">
                                    {comments.map(c => (
                                        <div key={c.id} className="bg-card border border-border rounded-xl p-4">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-egypt-gold flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                                        {(c.profile as any)?.full_name?.[0]?.toUpperCase() || "?"}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {(c.profile as any)?.full_name || "Anonymous"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(c.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric", day: "numeric" })}
                                                        </p>
                                                    </div>
                                                </div>
                                                {userId && (
                                                    <button className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                                                        <Flag className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed">{c.content}</p>
                                        </div>
                                    ))}
                                    {comments.length === 0 && (
                                        <div className="text-center py-10 text-muted-foreground">
                                            <div className="text-4xl mb-3">💬</div>
                                            <p>No reviews yet. Be the first!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Info sidebar */}
                        <div className="space-y-5">
                            {/* Info card */}
                            <div className="bg-card border border-border rounded-2xl p-5 space-y-4 sticky top-24">
                                <h3 className="font-semibold text-foreground">Details</h3>

                                {item.location && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-4 h-4 text-egypt-gold mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">{item.address || item.location.name}</p>
                                            <p className="text-xs text-muted-foreground">{item.location.governorate}</p>
                                        </div>
                                    </div>
                                )}

                                {(item.min_price || item.max_price) && (
                                    <div className="flex items-start gap-3">
                                        <DollarSign className="w-4 h-4 text-egypt-gold mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-foreground font-medium">
                                                {item.price_range ? PRICE_RANGE_LABELS[item.price_range] : "Varies"}
                                            </p>
                                            {item.min_price && item.max_price && (
                                                <p className="text-xs text-muted-foreground">
                                                    {item.min_price} – {item.max_price} {item.currency}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {item.contact_phone && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-egypt-gold flex-shrink-0" />
                                        <a href={`tel:${item.contact_phone}`} className="text-sm text-foreground hover:text-egypt-gold transition-colors">
                                            {item.contact_phone}
                                        </a>
                                    </div>
                                )}

                                {item.website && (
                                    <div className="flex items-center gap-3">
                                        <Globe className="w-4 h-4 text-egypt-gold flex-shrink-0" />
                                        <a href={item.website} target="_blank" rel="noopener noreferrer"
                                            className="text-sm text-foreground hover:text-egypt-gold transition-colors flex items-center gap-1 truncate">
                                            Visit Website <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                        </a>
                                    </div>
                                )}

                                {item.google_maps_url && (
                                    <a
                                        href={item.google_maps_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full gradient-egypt text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity mt-2"
                                    >
                                        <MapPin className="w-4 h-4" />
                                        View on Google Maps
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
