"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Heart, Star, MapPin, DollarSign, Eye } from "lucide-react";
import { Item, PRICE_RANGE_LABELS, CATEGORY_ICONS, CATEGORY_LABELS } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface ItemCardProps {
    item: Item;
    onFavoriteChange?: (itemId: string, isFavorite: boolean) => void;
}

const PRICE_RANGE_COLOR = {
    budget: "text-emerald-600 dark:text-emerald-400",
    moderate: "text-amber-600 dark:text-amber-400",
    expensive: "text-orange-600 dark:text-orange-400",
    luxury: "text-rose-600 dark:text-rose-400",
};

const PRICE_RANGE_SYMBOL = {
    budget: "﹩",
    moderate: "﹩﹩",
    expensive: "﹩﹩﹩",
    luxury: "﹩﹩﹩﹩",
};

export function ItemCard({ item, onFavoriteChange }: ItemCardProps) {
    const [isFavorite, setIsFavorite] = useState(item.is_favorite ?? false);
    const [favLoading, setFavLoading] = useState(false);
    const supabase = createClient();

    const handleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error("Please sign in to save favorites");
            return;
        }

        setFavLoading(true);
        try {
            if (isFavorite) {
                await supabase
                    .from("favorites")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("item_id", item.id);
                setIsFavorite(false);
                onFavoriteChange?.(item.id, false);
                toast.success("Removed from favorites");
            } else {
                await supabase
                    .from("favorites")
                    .insert({ user_id: user.id, item_id: item.id });
                setIsFavorite(true);
                onFavoriteChange?.(item.id, true);
                toast.success("Added to favorites! ❤️");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setFavLoading(false);
        }
    };

    const categoryIcon = CATEGORY_ICONS[item.category] || "📍";
    const categoryLabel = CATEGORY_LABELS[item.category] || item.category;

    return (
        <Link href={`/item/${item.slug}`} className="group block">
            <article className="bg-card border border-border rounded-2xl overflow-hidden card-hover shadow-sm h-full flex flex-col">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {item.image_url ? (
                        <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center gradient-sand">
                            <span className="text-6xl opacity-40">{categoryIcon}</span>
                        </div>
                    )}

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Featured badge */}
                    {item.is_featured && (
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-egypt-gold text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                            <Star className="w-3 h-3 fill-current" />
                            Featured
                        </div>
                    )}

                    {/* Category chip */}
                    <div className="absolute top-3 right-3">
                        <span className="glass text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                            {categoryIcon} {categoryLabel}
                        </span>
                    </div>

                    {/* Favorite button */}
                    <button
                        onClick={handleFavorite}
                        disabled={favLoading}
                        className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg
              ${isFavorite
                                ? "bg-rose-500 text-white scale-110"
                                : "glass text-white hover:bg-rose-500 hover:scale-110"
                            }
              ${favLoading ? "opacity-50 cursor-wait" : ""}
            `}
                        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                        <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                    </button>

                    {/* Views */}
                    {item.total_views > 0 && (
                        <div className="absolute bottom-3 left-3 flex items-center gap-1 glass text-white text-xs px-2 py-1 rounded-full">
                            <Eye className="w-3 h-3" />
                            {item.total_views.toLocaleString()}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-col gap-2.5 p-4 flex-1">
                    {/* Title */}
                    <h3 className="font-display font-semibold text-foreground text-base leading-tight group-hover:text-egypt-gold transition-colors line-clamp-2">
                        {item.title}
                    </h3>

                    {/* Location */}
                    {item.location && (
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                            <MapPin className="w-3.5 h-3.5 text-egypt-gold flex-shrink-0" />
                            <span className="truncate">{item.location.name}, {item.location.governorate}</span>
                        </div>
                    )}

                    {/* Description */}
                    {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {item.description}
                        </p>
                    )}

                    {/* Tags */}
                    {item.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {item.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Footer: Rating + Price */}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                        {/* Rating */}
                        <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-3.5 h-3.5 ${star <= Math.round(item.average_rating)
                                                ? "fill-egypt-gold text-egypt-gold"
                                                : "text-muted-foreground/30"
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-xs font-semibold text-foreground">
                                {item.average_rating > 0 ? item.average_rating.toFixed(1) : "New"}
                            </span>
                            {item.total_ratings > 0 && (
                                <span className="text-xs text-muted-foreground">
                                    ({item.total_ratings})
                                </span>
                            )}
                        </div>

                        {/* Price */}
                        {item.price_range && (
                            <div className={`flex items-center gap-1 text-xs font-bold ${PRICE_RANGE_COLOR[item.price_range]}`}>
                                <DollarSign className="w-3 h-3" />
                                {PRICE_RANGE_SYMBOL[item.price_range]}
                                {item.min_price !== undefined && item.max_price !== undefined && (
                                    <span className="font-normal text-muted-foreground ml-0.5">
                                        {item.min_price}–{item.max_price} EGP
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </article>
        </Link>
    );
}

// Skeleton card for loading states
export function ItemCardSkeleton() {
    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="aspect-[4/3] shimmer" />
            <div className="p-4 space-y-3">
                <div className="h-4 shimmer rounded-full w-3/4" />
                <div className="h-3 shimmer rounded-full w-1/2" />
                <div className="h-3 shimmer rounded-full w-full" />
                <div className="h-3 shimmer rounded-full w-4/5" />
                <div className="flex justify-between pt-3 border-t border-border">
                    <div className="h-3 shimmer rounded-full w-24" />
                    <div className="h-3 shimmer rounded-full w-16" />
                </div>
            </div>
        </div>
    );
}
