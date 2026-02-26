"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, Map, Utensils, Star, MessageSquare, Lightbulb, Users, Settings, Plus, Edit2, Trash2, Check, X, Eye, EyeOff, ChevronLeft, Upload, MapPin, LogOut, Compass, Search, Filter, TrendingUp, Heart } from "lucide-react";
import {
    Item, Suggestion, Comment, Profile, Category, Location, PriceRange,
    CATEGORY_ICONS, CATEGORY_LABELS, PRICE_RANGE_LABELS
} from "@/lib/types";

const TABS = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "items", label: "Manage Items", icon: Map },
    { id: "suggestions", label: "Suggestions", icon: Lightbulb },
    { id: "comments", label: "Comments", icon: MessageSquare },
    { id: "users", label: "Users", icon: Users },
    { id: "locations", label: "Locations", icon: MapPin },
    { id: "add-item", label: "Add Item", icon: Plus },
];

const CATEGORIES: Category[] = ["place", "restaurant", "food", "drink", "activity", "hotel", "service"];
const PRICE_RANGES: PriceRange[] = ["budget", "moderate", "expensive", "luxury"];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Data
    const [items, setItems] = useState<Item[]>([]);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [users, setUsers] = useState<Profile[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [stats, setStats] = useState({ items: 0, suggestions: 0, comments: 0, users: 0, favorites: 0 });

    // Form state for add/edit item
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [itemForm, setItemForm] = useState({
        title: "", slug: "", description: "", category: "" as Category | "",
        location_id: "", address: "", price_range: "" as PriceRange | "",
        min_price: "", max_price: "", currency: "EGP", image_url: "",
        tags: "", contact_phone: "", contact_email: "", website: "",
        google_maps_url: "", is_featured: false, status: "active" as "active" | "inactive" | "pending",
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/auth/login"); return; }

            const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
            if (!profileData || profileData.role !== "admin") {
                toast.error("Access denied. Admin only.");
                router.push("/");
                return;
            }
            setProfile(profileData as Profile);
            setLoading(false);
            loadAllData();
        };
        init();
    }, []);

    const loadAllData = async () => {
        const [itemsRes, sugRes, comRes, usersRes, locsRes] = await Promise.all([
            supabase.from("items").select("*, location:locations(*)").order("created_at", { ascending: false }),
            supabase.from("suggestions").select("*, profile:profiles(full_name, email), location:locations(name)").order("created_at", { ascending: false }),
            supabase.from("comments").select("*, profile:profiles(full_name, email), item:items(title)").order("created_at", { ascending: false }),
            supabase.from("profiles").select("*").order("created_at", { ascending: false }),
            supabase.from("locations").select("*").order("name"),
        ]);

        setItems((itemsRes.data as Item[]) || []);
        setSuggestions((sugRes.data as Suggestion[]) || []);
        setComments((comRes.data as Comment[]) || []);
        setUsers((usersRes.data as Profile[]) || []);
        setLocations((locsRes.data as Location[]) || []);

        const [favCount] = await Promise.all([
            supabase.from("favorites").select("id", { count: "exact", head: true }),
        ]);

        setStats({
            items: itemsRes.count || itemsRes.data?.length || 0,
            suggestions: sugRes.data?.filter((s: any) => s.status === "pending").length || 0,
            comments: comRes.data?.length || 0,
            users: usersRes.data?.length || 0,
            favorites: favCount.count || 0,
        });
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const generateSlug = (title: string) =>
        title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
    };

    const handleSaveItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemForm.title || !itemForm.category) { toast.error("Title and category required"); return; }
        setFormLoading(true);

        let imageUrl = itemForm.image_url;

        if (imageFile) {
            const ext = imageFile.name.split(".").pop();
            const fileName = `item-${Date.now()}.${ext}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from("item-images")
                .upload(fileName, imageFile);

            if (!uploadError && uploadData) {
                const { data: { publicUrl } } = supabase.storage.from("item-images").getPublicUrl(uploadData.path);
                imageUrl = publicUrl;
            }
        }

        const payload = {
            title: itemForm.title,
            slug: itemForm.slug || generateSlug(itemForm.title),
            description: itemForm.description,
            category: itemForm.category,
            location_id: itemForm.location_id || null,
            address: itemForm.address,
            price_range: itemForm.price_range || null,
            min_price: itemForm.min_price ? parseFloat(itemForm.min_price) : null,
            max_price: itemForm.max_price ? parseFloat(itemForm.max_price) : null,
            currency: itemForm.currency,
            image_url: imageUrl,
            tags: itemForm.tags ? itemForm.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
            contact_phone: itemForm.contact_phone,
            contact_email: itemForm.contact_email,
            website: itemForm.website,
            google_maps_url: itemForm.google_maps_url,
            is_featured: itemForm.is_featured,
            status: itemForm.status,
        };

        let error;
        if (editingItem) {
            ({ error } = await supabase.from("items").update(payload).eq("id", editingItem.id));
        } else {
            ({ error } = await supabase.from("items").insert(payload));
        }

        if (error) { toast.error("Error: " + error.message); }
        else { toast.success(editingItem ? "Item updated!" : "Item created! 🎉"); resetForm(); loadAllData(); setActiveTab("items"); }
        setFormLoading(false);
    };

    const resetForm = () => {
        setEditingItem(null);
        setItemForm({ title: "", slug: "", description: "", category: "" as Category | "", location_id: "", address: "", price_range: "" as PriceRange | "", min_price: "", max_price: "", currency: "EGP", image_url: "", tags: "", contact_phone: "", contact_email: "", website: "", google_maps_url: "", is_featured: false, status: "active" });
        setImageFile(null);
        setImagePreview(null);
    };

    const startEdit = (item: Item) => {
        setEditingItem(item);
        setItemForm({
            title: item.title, slug: item.slug, description: item.description || "",
            category: item.category, location_id: item.location_id || "", address: item.address || "",
            price_range: item.price_range || "" as PriceRange | "", min_price: item.min_price?.toString() || "",
            max_price: item.max_price?.toString() || "", currency: item.currency, image_url: item.image_url || "",
            tags: item.tags?.join(", ") || "", contact_phone: item.contact_phone || "",
            contact_email: item.contact_email || "", website: item.website || "",
            google_maps_url: item.google_maps_url || "", is_featured: item.is_featured, status: item.status,
        });
        setImagePreview(item.image_url || null);
        setActiveTab("add-item");
    };

    const deleteItem = async (id: string) => {
        if (!confirm("Delete this item permanently?")) return;
        const { error } = await supabase.from("items").delete().eq("id", id);
        if (!error) { toast.success("Deleted"); loadAllData(); }
        else toast.error("Failed to delete");
    };

    const toggleFeatured = async (item: Item) => {
        await supabase.from("items").update({ is_featured: !item.is_featured }).eq("id", item.id);
        toast.success(item.is_featured ? "Removed from featured" : "Added to featured ⭐");
        loadAllData();
    };

    const handleSuggestion = async (id: string, status: "approved" | "rejected", notes?: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("suggestions").update({
            status,
            admin_notes: notes,
            reviewed_by: user?.id,
            reviewed_at: new Date().toISOString(),
        }).eq("id", id);
        toast.success(status === "approved" ? "Suggestion approved and added to items!" : "Suggestion rejected");
        loadAllData();
    };

    const deleteComment = async (id: string) => {
        await supabase.from("comments").delete().eq("id", id);
        toast.success("Comment deleted");
        loadAllData();
    };

    const toggleCommentApproval = async (comment: Comment) => {
        await supabase.from("comments").update({ is_approved: !comment.is_approved }).eq("id", comment.id);
        loadAllData();
    };

    const setUserRole = async (userId: string, role: "user" | "admin") => {
        await supabase.from("profiles").update({ role }).eq("id", userId);
        toast.success(`Role updated to ${role}`);
        loadAllData();
    };

    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-xl gradient-egypt flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Image src="/logo.png" alt="Egypt Explorer Logo" width={24} height={24} className="w-6 h-6 object-contain" unoptimized />
                    </div>
                    <p className="text-muted-foreground">Loading Admin Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? "w-64" : "w-16"} transition-all duration-300 bg-egypt-hieroglyph dark:bg-gray-950 flex flex-col flex-shrink-0`}>
                {/* Logo */}
                <div className="p-4 border-b border-white/10 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl gradient-egypt flex items-center justify-center flex-shrink-0">
                        <Image src="/logo.png" alt="Egypt Explorer Logo" width={20} height={20} className="w-5 h-5 object-contain" unoptimized />
                    </div>
                    {sidebarOpen && (
                        <div>
                            <p className="font-display font-bold text-white text-sm leading-none">Egypt Explorer</p>
                            <p className="text-xs text-egypt-gold">Admin Panel</p>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 space-y-1">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); if (tab.id !== "add-item") resetForm(); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${activeTab === tab.id ? "bg-egypt-gold text-white" : "text-gray-400 hover:text-white hover:bg-white/10"}`}
                        >
                            <tab.icon className="w-4 h-4 flex-shrink-0" />
                            {sidebarOpen && <span>{tab.label}</span>}
                            {sidebarOpen && tab.id === "suggestions" && stats.suggestions > 0 && (
                                <span className="ml-auto bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                    {stats.suggestions}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* User */}
                <div className="p-3 border-t border-white/10 space-y-2">
                    <Link href="/" className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors`}>
                        <Eye className="w-4 h-4 flex-shrink-0" />
                        {sidebarOpen && "View Site"}
                    </Link>
                    <button onClick={handleSignOut} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-rose-400 hover:bg-white/10 transition-colors`}>
                        <LogOut className="w-4 h-4 flex-shrink-0" />
                        {sidebarOpen && "Sign Out"}
                    </button>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                        <ChevronLeft className={`w-4 h-4 flex-shrink-0 transition-transform ${!sidebarOpen ? "rotate-180" : ""}`} />
                        {sidebarOpen && "Collapse"}
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
                    <h1 className="font-display font-bold text-foreground text-lg capitalize">
                        {TABS.find(t => t.id === activeTab)?.label || "Dashboard"}
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-egypt flex items-center justify-center text-white text-sm font-bold">
                            {profile?.full_name?.[0]?.toUpperCase() || "A"}
                        </div>
                        <span className="text-sm font-medium text-foreground hidden sm:block">
                            {profile?.full_name || profile?.email}
                        </span>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-6">

                    {/* ═══ OVERVIEW ══════════════════════════════════════════ */}
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                {[
                                    { label: "Total Items", value: items.length, icon: Map, color: "text-amber-500" },
                                    { label: "Pending Suggestions", value: stats.suggestions, icon: Lightbulb, color: "text-indigo-500" },
                                    { label: "Comments", value: comments.length, icon: MessageSquare, color: "text-cyan-500" },
                                    { label: "Users", value: users.length, icon: Users, color: "text-emerald-500" },
                                    { label: "Favorites", value: stats.favorites, icon: Heart, color: "text-rose-500" },
                                ].map((stat) => (
                                    <div key={stat.label} className="bg-card border border-border rounded-2xl p-5">
                                        <stat.icon className={`w-8 h-8 ${stat.color} mb-3`} />
                                        <div className="text-2xl font-bold text-foreground font-display">{stat.value}</div>
                                        <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Recent items table */}
                            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                                <div className="p-5 border-b border-border flex items-center justify-between">
                                    <h2 className="font-semibold text-foreground">Recent Items</h2>
                                    <button onClick={() => setActiveTab("add-item")} className="flex items-center gap-1.5 text-sm gradient-egypt text-white px-4 py-2 rounded-xl hover:opacity-90">
                                        <Plus className="w-4 h-4" /> Add Item
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-xs text-muted-foreground bg-muted/50">
                                                <th className="text-left px-5 py-3 font-semibold">Item</th>
                                                <th className="text-left px-5 py-3 font-semibold">Category</th>
                                                <th className="text-left px-5 py-3 font-semibold">Rating</th>
                                                <th className="text-left px-5 py-3 font-semibold">Status</th>
                                                <th className="text-left px-5 py-3 font-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {items.slice(0, 8).map(item => (
                                                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-3">
                                                            {item.image_url && (
                                                                <div className="w-10 h-8 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                                                    <Image src={item.image_url} alt="" width={40} height={32} className="w-full h-full object-cover" />
                                                                </div>
                                                            )}
                                                            <span className="text-sm font-medium text-foreground truncate max-w-[200px]">{item.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <span className="text-sm text-muted-foreground">
                                                            {CATEGORY_ICONS[item.category]} {CATEGORY_LABELS[item.category]}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <span className="text-sm font-medium text-foreground">
                                                            {item.average_rating > 0 ? `${item.average_rating.toFixed(1)} ⭐` : "—"}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" :
                                                            item.status === "pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" :
                                                                "bg-muted text-muted-foreground"
                                                            }`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => startEdit(item)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ MANAGE ITEMS ════════════════════════════════════ */}
                    {activeTab === "items" && (
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="flex-1 flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5">
                                    <Search className="w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search items..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex-1 bg-transparent outline-none text-sm text-foreground"
                                    />
                                </div>
                                <button onClick={() => setActiveTab("add-item")} className="flex items-center gap-2 gradient-egypt text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90">
                                    <Plus className="w-4 h-4" /> Add Item
                                </button>
                            </div>

                            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-xs text-muted-foreground bg-muted/50">
                                                <th className="text-left px-5 py-3 font-semibold">Item</th>
                                                <th className="text-left px-5 py-3 font-semibold">Category</th>
                                                <th className="text-left px-5 py-3 font-semibold">Location</th>
                                                <th className="text-left px-5 py-3 font-semibold">Rating</th>
                                                <th className="text-left px-5 py-3 font-semibold">Featured</th>
                                                <th className="text-left px-5 py-3 font-semibold">Status</th>
                                                <th className="text-left px-5 py-3 font-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {filteredItems.map(item => (
                                                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-3">
                                                            {item.image_url ? (
                                                                <div className="w-10 h-8 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                                                    <Image src={item.image_url} alt="" width={40} height={32} className="w-full h-full object-cover" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-10 h-8 rounded-lg bg-muted flex items-center justify-center text-lg flex-shrink-0">
                                                                    {CATEGORY_ICONS[item.category]}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-sm font-medium text-foreground truncate max-w-[180px]">{item.title}</p>
                                                                <p className="text-xs text-muted-foreground">{item.total_views} views</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <span className="text-sm text-muted-foreground">{CATEGORY_ICONS[item.category]} {CATEGORY_LABELS[item.category]}</span>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <span className="text-sm text-muted-foreground">{(item.location as any)?.name || "—"}</span>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <span className="text-sm font-medium">{item.average_rating > 0 ? `${item.average_rating.toFixed(1)} ⭐ (${item.total_ratings})` : "—"}</span>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <button onClick={() => toggleFeatured(item)} className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${item.is_featured ? "bg-egypt-gold" : "bg-muted"}`}>
                                                            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5 ${item.is_featured ? "translate-x-4.5" : "translate-x-0.5"}`} style={{ transform: item.is_featured ? "translateX(19px)" : "translateX(2px)" }} />
                                                        </button>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <select
                                                            value={item.status}
                                                            onChange={async (e) => {
                                                                await supabase.from("items").update({ status: e.target.value }).eq("id", item.id);
                                                                loadAllData();
                                                            }}
                                                            className="text-xs bg-background border border-border rounded-lg px-2 py-1 outline-none"
                                                        >
                                                            <option value="active">Active</option>
                                                            <option value="inactive">Inactive</option>
                                                            <option value="pending">Pending</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-1.5">
                                                            <Link href={`/item/${item.slug}`} target="_blank" className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                                                                <Eye className="w-3.5 h-3.5" />
                                                            </Link>
                                                            <button onClick={() => startEdit(item)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ SUGGESTIONS ════════════════════════════════════ */}
                    {activeTab === "suggestions" && (
                        <div className="space-y-4">
                            {["pending", "approved", "rejected"].map(status => {
                                const filtered = suggestions.filter(s => s.status === status);
                                if (filtered.length === 0) return null;
                                return (
                                    <div key={status} className="bg-card border border-border rounded-2xl overflow-hidden">
                                        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${status === "pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" :
                                                status === "approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" :
                                                    "bg-muted text-muted-foreground"
                                                }`}>{status}</span>
                                            <span className="text-sm text-muted-foreground">{filtered.length} suggestion(s)</span>
                                        </div>
                                        <div className="divide-y divide-border">
                                            {filtered.map(sug => (
                                                <div key={sug.id} className="p-5">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-semibold text-foreground text-sm">{sug.title}</h3>
                                                                <span className="text-xs text-muted-foreground">{CATEGORY_ICONS[sug.category]} {sug.category}</span>
                                                            </div>
                                                            {sug.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{sug.description}</p>}
                                                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                                                {(sug.profile as any)?.full_name && <span>👤 {(sug.profile as any)?.full_name}</span>}
                                                                {(sug.location as any)?.name && <span>📍 {(sug.location as any)?.name}</span>}
                                                                {sug.address && <span>🏠 {sug.address}</span>}
                                                                <span>📅 {new Date(sug.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                        {sug.image_url && (
                                                            <div className="w-20 h-14 rounded-xl overflow-hidden flex-shrink-0">
                                                                <Image src={sug.image_url} alt="" width={80} height={56} className="w-full h-full object-cover" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    {status === "pending" && (
                                                        <div className="flex gap-2 mt-4">
                                                            <button
                                                                onClick={() => handleSuggestion(sug.id, "approved")}
                                                                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-xl text-sm font-medium hover:opacity-80 transition-opacity"
                                                            >
                                                                <Check className="w-4 h-4" /> Approve & Add
                                                            </button>
                                                            <button
                                                                onClick={() => handleSuggestion(sug.id, "rejected", "Does not meet our guidelines")}
                                                                className="flex items-center gap-1.5 px-4 py-2 bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 rounded-xl text-sm font-medium hover:opacity-80 transition-opacity"
                                                            >
                                                                <X className="w-4 h-4" /> Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            {suggestions.length === 0 && (
                                <div className="text-center py-20">
                                    <Lightbulb className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                    <p className="text-muted-foreground">No suggestions yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══ COMMENTS ════════════════════════════════════════ */}
                    {activeTab === "comments" && (
                        <div className="bg-card border border-border rounded-2xl overflow-hidden">
                            <div className="p-5 border-b border-border">
                                <h2 className="font-semibold text-foreground">All Comments ({comments.length})</h2>
                            </div>
                            <div className="divide-y divide-border">
                                {comments.map(comment => (
                                    <div key={comment.id} className="p-5">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-medium text-foreground">
                                                        {(comment.profile as any)?.full_name || "Anonymous"}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">on</span>
                                                    <span className="text-xs text-egypt-gold truncate max-w-[150px]">
                                                        {(comment as any)?.item?.title || "Unknown item"}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{comment.content}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                    {comment.is_flagged && <span className="ml-2 text-rose-500">🚩 Flagged</span>}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleCommentApproval(comment)}
                                                    className={`p-1.5 rounded-lg transition-colors ${comment.is_approved ? "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" : "text-muted-foreground hover:bg-muted"}`}
                                                    title={comment.is_approved ? "Hide comment" : "Approve comment"}
                                                >
                                                    {comment.is_approved ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                </button>
                                                <button onClick={() => deleteComment(comment.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ═══ USERS ════════════════════════════════════════════ */}
                    {activeTab === "users" && (
                        <div className="bg-card border border-border rounded-2xl overflow-hidden">
                            <div className="p-5 border-b border-border">
                                <h2 className="font-semibold text-foreground">All Users ({users.length})</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-xs text-muted-foreground bg-muted/50">
                                            <th className="text-left px-5 py-3 font-semibold">User</th>
                                            <th className="text-left px-5 py-3 font-semibold">Joined</th>
                                            <th className="text-left px-5 py-3 font-semibold">Role</th>
                                            <th className="text-left px-5 py-3 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {users.map(user => (
                                            <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full gradient-egypt flex items-center justify-center text-white text-sm font-bold">
                                                            {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "?"}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground">{user.full_name || "No name"}</p>
                                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-sm text-muted-foreground">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${user.role === "admin"
                                                        ? "bg-egypt-gold/20 text-egypt-dark-gold"
                                                        : "bg-muted text-muted-foreground"
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    {user.id !== profile?.id && (
                                                        <select
                                                            value={user.role}
                                                            onChange={(e) => setUserRole(user.id, e.target.value as "user" | "admin")}
                                                            className="text-xs bg-background border border-border rounded-lg px-2 py-1 outline-none"
                                                        >
                                                            <option value="user">User</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ═══ LOCATIONS ════════════════════════════════════════ */}
                    {activeTab === "locations" && (
                        <div className="bg-card border border-border rounded-2xl overflow-hidden">
                            <div className="p-5 border-b border-border">
                                <h2 className="font-semibold text-foreground">Locations ({locations.length})</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-xs text-muted-foreground bg-muted/50">
                                            <th className="text-left px-5 py-3 font-semibold">Name</th>
                                            <th className="text-left px-5 py-3 font-semibold">Arabic</th>
                                            <th className="text-left px-5 py-3 font-semibold">Governorate</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {locations.map(loc => (
                                            <tr key={loc.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-5 py-3 text-sm font-medium text-foreground">{loc.name}</td>
                                                <td className="px-5 py-3 text-sm text-muted-foreground font-arabic">{loc.name_ar}</td>
                                                <td className="px-5 py-3 text-sm text-muted-foreground">{loc.governorate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ═══ ADD / EDIT ITEM ═════════════════════════════════ */}
                    {activeTab === "add-item" && (
                        <form onSubmit={handleSaveItem} className="space-y-6 max-w-2xl mx-auto">
                            <div className="flex items-center justify-between">
                                <h2 className="font-display text-xl font-bold text-foreground">
                                    {editingItem ? `Editing: ${editingItem.title}` : "Add New Item"}
                                </h2>
                                {editingItem && (
                                    <button type="button" onClick={resetForm} className="text-sm text-muted-foreground hover:text-foreground">
                                        ← Create New Instead
                                    </button>
                                )}
                            </div>

                            {/* Basic */}
                            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                                <h3 className="font-semibold text-foreground">Basic Information</h3>

                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-1.5">Title <span className="text-destructive">*</span></label>
                                    <input type="text" value={itemForm.title} onChange={(e) => {
                                        const title = e.target.value;
                                        setItemForm(p => ({ ...p, title, slug: p.slug || generateSlug(title) }));
                                    }} required placeholder="e.g. Pyramids of Giza"
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-egypt-gold/50" />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-1.5">Slug</label>
                                    <input type="text" value={itemForm.slug} onChange={(e) => setItemForm(p => ({ ...p, slug: e.target.value }))} placeholder="auto-generated"
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-egypt-gold/50" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-1.5">Category <span className="text-destructive">*</span></label>
                                        <select value={itemForm.category} onChange={(e) => setItemForm(p => ({ ...p, category: e.target.value as Category }))}
                                            required className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none">
                                            <option value="">Select...</option>
                                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-1.5">Status</label>
                                        <select value={itemForm.status} onChange={(e) => setItemForm(p => ({ ...p, status: e.target.value as any }))}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none">
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="pending">Pending</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-1.5">Description</label>
                                    <textarea value={itemForm.description} onChange={(e) => setItemForm(p => ({ ...p, description: e.target.value }))}
                                        rows={4} placeholder="Detailed description..." className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none resize-none" />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-1.5">Tags (comma-separated)</label>
                                    <input type="text" value={itemForm.tags} onChange={(e) => setItemForm(p => ({ ...p, tags: e.target.value }))}
                                        placeholder="e.g. historic, family-friendly, outdoor"
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none" />
                                </div>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={itemForm.is_featured} onChange={(e) => setItemForm(p => ({ ...p, is_featured: e.target.checked }))} className="w-4 h-4 rounded" />
                                    <span className="text-sm font-medium text-foreground">⭐ Featured Item (shown on homepage)</span>
                                </label>
                            </div>

                            {/* Location & pricing */}
                            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                                <h3 className="font-semibold text-foreground">Location & Pricing</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-1.5">Location</label>
                                        <select value={itemForm.location_id} onChange={(e) => setItemForm(p => ({ ...p, location_id: e.target.value }))}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none">
                                            <option value="">Select...</option>
                                            {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-1.5">Price Range</label>
                                        <select value={itemForm.price_range} onChange={(e) => setItemForm(p => ({ ...p, price_range: e.target.value as PriceRange }))}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none">
                                            <option value="">Not specified</option>
                                            {PRICE_RANGES.map(pr => <option key={pr} value={pr}>{PRICE_RANGE_LABELS[pr]}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-1.5">Address</label>
                                    <input type="text" value={itemForm.address} onChange={(e) => setItemForm(p => ({ ...p, address: e.target.value }))}
                                        placeholder="Full address" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none" />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-1.5">Min Price</label>
                                        <input type="number" value={itemForm.min_price} onChange={(e) => setItemForm(p => ({ ...p, min_price: e.target.value }))}
                                            placeholder="0" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-1.5">Max Price</label>
                                        <input type="number" value={itemForm.max_price} onChange={(e) => setItemForm(p => ({ ...p, max_price: e.target.value }))}
                                            placeholder="0" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-1.5">Currency</label>
                                        <input type="text" value={itemForm.currency} onChange={(e) => setItemForm(p => ({ ...p, currency: e.target.value }))}
                                            placeholder="EGP" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                                <h3 className="font-semibold text-foreground">Contact & Links</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-1.5">Phone</label>
                                        <input type="tel" value={itemForm.contact_phone} onChange={(e) => setItemForm(p => ({ ...p, contact_phone: e.target.value }))}
                                            placeholder="+20 ..." className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-1.5">Email</label>
                                        <input type="email" value={itemForm.contact_email} onChange={(e) => setItemForm(p => ({ ...p, contact_email: e.target.value }))}
                                            placeholder="info@..." className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-1.5">Website</label>
                                    <input type="url" value={itemForm.website} onChange={(e) => setItemForm(p => ({ ...p, website: e.target.value }))}
                                        placeholder="https://" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-1.5">Google Maps URL</label>
                                    <input type="url" value={itemForm.google_maps_url} onChange={(e) => setItemForm(p => ({ ...p, google_maps_url: e.target.value }))}
                                        placeholder="https://maps.google.com/..." className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none" />
                                </div>
                            </div>

                            {/* Image */}
                            <div className="bg-card border border-border rounded-2xl p-6">
                                <h3 className="font-semibold text-foreground mb-4">Main Image</h3>
                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-1.5">Image URL</label>
                                    <input type="url" value={itemForm.image_url} onChange={(e) => {
                                        setItemForm(p => ({ ...p, image_url: e.target.value }));
                                        if (e.target.value) setImagePreview(e.target.value);
                                    }} placeholder="https://..." className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none mb-3" />
                                </div>
                                <div className="text-sm text-muted-foreground mb-3 text-center">— OR —</div>
                                <label className="cursor-pointer block">
                                    {imagePreview ? (
                                        <div className="relative aspect-video rounded-xl overflow-hidden">
                                            <Image src={imagePreview} alt="" fill className="object-cover" />
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <span className="text-white text-sm">Change Image</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-egypt-gold transition-colors">
                                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">Click to upload</p>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                </label>
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3">
                                <button type="submit" disabled={formLoading}
                                    className="flex-1 gradient-egypt text-white font-semibold py-3.5 rounded-2xl hover:opacity-90 disabled:opacity-60 transition-opacity">
                                    {formLoading ? "Saving..." : editingItem ? "Update Item" : "Create Item"}
                                </button>
                                {editingItem && (
                                    <button type="button" onClick={resetForm} className="px-6 py-3.5 rounded-2xl bg-muted text-foreground font-semibold hover:bg-muted/80 transition-colors">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    )}

                </main>
            </div>
        </div>
    );
}
