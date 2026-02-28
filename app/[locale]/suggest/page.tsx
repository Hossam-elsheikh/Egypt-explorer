"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Category, Location, PriceRange, CATEGORY_LABELS, PRICE_RANGE_LABELS } from "@/lib/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Lightbulb, Upload, Send } from "lucide-react";
import Image from "next/image";

const CATEGORIES: Category[] = ["place", "restaurant", "food", "drink", "activity", "hotel", "service"];
const PRICE_RANGES: PriceRange[] = ["budget", "moderate", "expensive", "luxury"];

export default function SuggestPage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "" as Category | "",
        location_id: "",
        address: "",
        price_range: "" as PriceRange | "",
        min_price: "",
        max_price: "",
        contact_phone: "",
        website: "",
    });

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/auth/login");
                return;
            }
            setUserId(user.id);

            const { data: locs } = await supabase.from("locations").select("*").order("name");
            setLocations(locs || []);
        };
        init();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;
        if (!form.title || !form.category) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);

        let imageUrl: string | undefined;

        // Upload image if provided
        if (imageFile) {
            const ext = imageFile.name.split(".").pop();
            const fileName = `${userId}-${Date.now()}.${ext}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from("suggestion-images")
                .upload(fileName, imageFile);

            if (!uploadError && uploadData) {
                const { data: { publicUrl } } = supabase.storage
                    .from("suggestion-images")
                    .getPublicUrl(uploadData.path);
                imageUrl = publicUrl;
            }
        }

        const { error } = await supabase.from("suggestions").insert({
            user_id: userId,
            title: form.title,
            description: form.description,
            category: form.category,
            location_id: form.location_id || null,
            address: form.address,
            price_range: form.price_range || null,
            min_price: form.min_price ? parseFloat(form.min_price) : null,
            max_price: form.max_price ? parseFloat(form.max_price) : null,
            contact_phone: form.contact_phone,
            website: form.website,
            image_url: imageUrl,
            status: "pending",
        });

        if (error) {
            toast.error("Failed to submit suggestion: " + error.message);
        } else {
            setSubmitted(true);
            toast.success("Suggestion submitted! Our team will review it. 🎉");
        }
        setLoading(false);
    };

    const update = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    if (submitted) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen bg-background flex items-center justify-center pt-16 px-4">
                    <div className="text-center max-w-md">
                        <div className="text-6xl mb-6">🎉</div>
                        <h1 className="font-display text-3xl font-bold text-foreground mb-3">
                            Thank you for your suggestion!
                        </h1>
                        <p className="text-muted-foreground mb-8">
                            Our team will review your submission and add it to the guide if approved.
                            You&apos;ll be notified once it goes live.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => { setSubmitted(false); setForm({ title: "", description: "", category: "" as Category | "", location_id: "", address: "", price_range: "" as PriceRange | "", min_price: "", max_price: "", contact_phone: "", website: "" }); setImageFile(null); setImagePreview(null); }}
                                className="px-6 py-3 rounded-xl gradient-egypt text-white font-semibold hover:opacity-90 transition-opacity"
                            >
                                Submit Another
                            </button>
                            <button onClick={() => router.push("/")} className="px-6 py-3 rounded-xl bg-muted text-foreground font-semibold hover:bg-muted/80 transition-colors">
                                Go Home
                            </button>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-background">
                {/* Header */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 pt-24 pb-12">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
                            <Lightbulb className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
                            Suggest a Place
                        </h1>
                        <p className="text-white/70 text-lg">
                            Know a hidden gem in Egypt? Share it with fellow travelers and help build our guide!
                        </p>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                            <h2 className="font-semibold text-foreground text-lg">Basic Information</h2>

                            <div>
                                <label className="text-sm font-medium text-foreground block mb-2">
                                    Place Name <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => update("title", e.target.value)}
                                    required
                                    placeholder="e.g. El Fishawy Café"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-egypt-gold/50 focus:border-egypt-gold"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-foreground block mb-2">
                                    Category <span className="text-destructive">*</span>
                                </label>
                                <select
                                    value={form.category}
                                    onChange={(e) => update("category", e.target.value)}
                                    required
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-egypt-gold/50"
                                >
                                    <option value="">Select a category</option>
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-foreground block mb-2">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => update("description", e.target.value)}
                                    placeholder="Tell us about this place..."
                                    rows={4}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-egypt-gold/50 resize-none"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                            <h2 className="font-semibold text-foreground text-lg">Location</h2>

                            <div>
                                <label className="text-sm font-medium text-foreground block mb-2">City / Governorate</label>
                                <select
                                    value={form.location_id}
                                    onChange={(e) => update("location_id", e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-egypt-gold/50"
                                >
                                    <option value="">Select location</option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name} — {loc.governorate}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-foreground block mb-2">Street Address</label>
                                <input
                                    type="text"
                                    value={form.address}
                                    onChange={(e) => update("address", e.target.value)}
                                    placeholder="e.g. Khan el-Khalili Bazaar, Cairo"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-egypt-gold/50"
                                />
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                            <h2 className="font-semibold text-foreground text-lg">Pricing (Optional)</h2>

                            <div>
                                <label className="text-sm font-medium text-foreground block mb-2">Price Range</label>
                                <select
                                    value={form.price_range}
                                    onChange={(e) => update("price_range", e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-egypt-gold/50"
                                >
                                    <option value="">Not sure</option>
                                    {PRICE_RANGES.map(pr => (
                                        <option key={pr} value={pr}>{PRICE_RANGE_LABELS[pr]}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-2">Min Price (EGP)</label>
                                    <input
                                        type="number"
                                        value={form.min_price}
                                        onChange={(e) => update("min_price", e.target.value)}
                                        placeholder="0"
                                        min="0"
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-egypt-gold/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-2">Max Price (EGP)</label>
                                    <input
                                        type="number"
                                        value={form.max_price}
                                        onChange={(e) => update("max_price", e.target.value)}
                                        placeholder="0"
                                        min="0"
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-egypt-gold/50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                            <h2 className="font-semibold text-foreground text-lg">Contact (Optional)</h2>

                            <div>
                                <label className="text-sm font-medium text-foreground block mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    value={form.contact_phone}
                                    onChange={(e) => update("contact_phone", e.target.value)}
                                    placeholder="+20 100 000 0000"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-egypt-gold/50"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-foreground block mb-2">Website</label>
                                <input
                                    type="url"
                                    value={form.website}
                                    onChange={(e) => update("website", e.target.value)}
                                    placeholder="https://..."
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-egypt-gold/50"
                                />
                            </div>
                        </div>

                        {/* Image */}
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <h2 className="font-semibold text-foreground text-lg mb-4">Photo (Optional)</h2>

                            <label className="cursor-pointer">
                                {imagePreview ? (
                                    <div className="relative aspect-video rounded-xl overflow-hidden">
                                        <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <span className="text-white text-sm font-medium">Change Photo</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-egypt-gold transition-colors">
                                        <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                                        <p className="text-sm font-medium text-foreground mb-1">Click to upload a photo</p>
                                        <p className="text-xs text-muted-foreground">PNG, JPG, WebP up to 5MB</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full gradient-egypt text-white font-semibold py-4 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 text-base"
                        >
                            <Send className="w-5 h-5" />
                            {loading ? "Submitting..." : "Submit Suggestion"}
                        </button>
                    </form>
                </div>
            </main>
            <Footer />
        </>
    );
}
