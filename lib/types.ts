// Egypt Tour Guide - Shared Types

export type Category = "place" | "restaurant" | "food" | "drink" | "service" | "hotel" | "activity";
export type ItemStatus = "active" | "inactive" | "pending";
export type PriceRange = "budget" | "moderate" | "expensive" | "luxury";
export type SuggestionStatus = "pending" | "approved" | "rejected";
export type UserRole = "user" | "admin";

export interface Profile {
    id: string;
    email?: string;
    full_name?: string;
    avatar_url?: string;
    role: UserRole;
    created_at: string;
    updated_at: string;
}

export interface Location {
    id: string;
    name: string;
    name_ar?: string;
    governorate: string;
    description?: string;
    image_url?: string;
    latitude?: number;
    longitude?: number;
    created_at: string;
}

export interface CategoryRecord {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    description?: string;
    type: Category;
    created_at: string;
}

export interface Item {
    id: string;
    title: string;
    slug: string;
    description?: string;
    category: Category;
    category_id?: string;
    location_id?: string;
    address?: string;
    price_range?: PriceRange;
    min_price?: number;
    max_price?: number;
    currency: string;
    image_url?: string;
    gallery_urls: string[];
    tags: string[];
    opening_hours?: OpeningHours;
    contact_phone?: string;
    contact_email?: string;
    website?: string;
    google_maps_url?: string;
    latitude?: number;
    longitude?: number;
    status: ItemStatus;
    is_featured: boolean;
    average_rating: number;
    total_ratings: number;
    total_views: number;
    created_by?: string;
    created_at: string;
    updated_at: string;
    // Joined fields
    location?: Location;
    category_record?: CategoryRecord;
    user_rating?: number;
    is_favorite?: boolean;
}

export interface OpeningHours {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
}

export interface Rating {
    id: string;
    item_id: string;
    user_id: string;
    rating: number;
    created_at: string;
    updated_at: string;
    profile?: Profile;
}

export interface Comment {
    id: string;
    item_id: string;
    user_id: string;
    content: string;
    is_flagged: boolean;
    is_approved: boolean;
    created_at: string;
    updated_at: string;
    profile?: Profile;
}

export interface Favorite {
    id: string;
    user_id: string;
    item_id: string;
    created_at: string;
    item?: Item;
}

export interface Suggestion {
    id: string;
    user_id?: string;
    title: string;
    description?: string;
    category: Category;
    address?: string;
    location_id?: string;
    price_range?: PriceRange;
    min_price?: number;
    max_price?: number;
    contact_phone?: string;
    website?: string;
    image_url?: string;
    status: SuggestionStatus;
    admin_notes?: string;
    reviewed_by?: string;
    reviewed_at?: string;
    created_at: string;
    updated_at: string;
    profile?: Profile;
    location?: Location;
}

// Price range display labels
export const PRICE_RANGE_LABELS: Record<PriceRange, string> = {
    budget: "Budget (< 100 EGP)",
    moderate: "Moderate (100–300 EGP)",
    expensive: "Expensive (300–700 EGP)",
    luxury: "Luxury (700+ EGP)",
};

export const PRICE_RANGE_ICONS: Record<PriceRange, string> = {
    budget: "﹩",
    moderate: "﹩﹩",
    expensive: "﹩﹩﹩",
    luxury: "﹩﹩﹩﹩",
};

// Category labels + icons
export const CATEGORY_LABELS: Record<Category, string> = {
    place: "Places",
    restaurant: "Restaurants",
    food: "Food",
    drink: "Drinks",
    service: "Services",
    hotel: "Hotels",
    activity: "Activities",
};

export const CATEGORY_ICONS: Record<Category, string> = {
    place: "🏛️",
    restaurant: "🍽️",
    food: "🥙",
    drink: "🥤",
    service: "🗺️",
    hotel: "🏨",
    activity: "⛵",
};

export const CATEGORY_COLORS: Record<Category, string> = {
    place: "from-amber-500 to-orange-500",
    restaurant: "from-red-500 to-rose-500",
    food: "from-yellow-500 to-amber-500",
    drink: "from-cyan-500 to-blue-500",
    service: "from-purple-500 to-violet-500",
    hotel: "from-emerald-500 to-teal-500",
    activity: "from-blue-500 to-indigo-500",
};
