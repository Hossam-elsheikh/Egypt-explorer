# EGYPT Explorer — Your Complete Travel Guide

A premium, localized travel platform designed to provide tourists with 7,000 years of history, vibrant cuisine, and modern wonders in Egypt. Built with **Next.js**, **Supabase**, and **next-intl**, this application offers a state-of-the-art user experience for discovering the magic of Egypt.

## 🏛️ Project Purpose

The primary mission of **EGYPT Explorer** is to provide an authentic, data-driven guide for travelers. Unlike generic booking sites, it focuses on real ratings, verified local content, and precise pricing information for:
- Ancient sites and historical monuments
- authentic Egyptian cuisine and modern dining
- Activities (Diving, Safaris, Stargazing)
- Essential services and accommodations

---

## 🏗️ Technical Workflow

### 1. Internationalization Architecture (`next-intl`)
The project uses a **Localized App Router** pattern. 
- **Middleware Integration**: `proxy.ts` (acting as the system middleware) handles session updates for Supabase while simultaneously processing `next-intl` locale redirects.
- **Routing Wrapper**: A custom `@/i18n/routing` provides localized versions of `Link`, `useRouter`, and `usePathname`, ensuring the user's language preference is preserved across the entire session.
- **Locale Scope**: All routes are structured under `app/[locale]`, allowing for static rendering and SEO optimization for 4 primary languages: English (EN), German (DE), French (FR), and Russian (RU).

### 2. Authentication & Data Layer (`Supabase`)
- **Supabase SSR**: Utilizes the `@supabase/ssr` package for server-side session management.
- **RLS (Row Level Security)**: Data is protected via Postgres policies, ensuring only authorized users can suggest places or access the Admin Panel.
- **Real-Time Database**: Travel items and locations are fetched dynamically with optimized queries for search and categorization.

### 3. Design System & UI/UX
- **Unified Branding**: A monochromatic, text-based logo strategy ("EGYPT" in `#f59e0b` / `text-egypt-gold`) that adapts to light/dark modes and scrolled states.
- **Premium Glassmorphism**: High-end visual depth achieved through `backdrop-filter: blur()`, using a custom-curated HSL color palette inspired by sand, lapis lazuli, and papyrus tones.
- **Hero & Search**: A cinematic hero section with localized search redirects, providing a seamless transition to the discovery results.

---

## 💎 Features Implemented

### Typographic Brand Identity
Replaced static image logos with a dynamic, typography-focused branding. The "Explorer" portion of the logo intelligently shifts between `text-white` and `text-foreground` based on the background context (e.g., Hero image vs. scrolled sticky Navbar).

### Cinematic Auth Pages
The Login and Sign-Up pages feature a dual-pane editorial layout:
- **Left Pane**: Rotating high-quality Egyptian travel photography with 110% zoom hover effects, blurred atmospheric blobs, and glass-morphic "trust badges" (Verified Gems, User Ratings).
- **Right Pane**: Minimalist, localized forms with real-time language switching and internationalized placeholders.

### "Why Explore Egypt?" Highlights
A high-engagement section featuring large, image-centric cards. 
- **Interaction**: On hover, background images zoom in smoothly while a tinted gradient reveal (Amber, Rose, Cyan, Yellow) and descriptive text slide into view.
- **Technical**: Responsive grid (1 to 4 columns) with shadow-depth transitions and golden accent reveals.

### Global Language Switcher
- **Navbar Integration**: Floating language switcher for global navigation.
- **Auth Page Selector**: Horizontal, low-friction language pills at the base of the Auth forms that refresh the entire UI context without losing the form context.

### Search & Filtering
- Localized search input that detects language preference and routes queries to the appropriate localized route (`/[locale]/search?q=...`).

---

## 🛠️ Tech Stack Details

| Technology | Purpose |
| :--- | :--- |
| **Next.js 15+** | Framework & Static/Server Rendering |
| **Supabase** | Auth, Database, and Session Middleware |
| **next-intl** | Core Internationalization (i18n) |
| **Tailwind CSS** | Premium Styling & Micro-animations |
| **Lucide React** | Consistent Iconography |
| **Playfair Display** | Font system for editorial headings (Titles) |
| **Plus Jakarta Sans** | Font system for clarity (UI/Text) |

---

## 🚀 Getting Started

1.  **Clone & Install**: `npm install`
2.  **Environment Setup**: Configure `.env.local` with your Supabase URL and Anon Key.
3.  **Run**: `npm run dev`
4.  **Admin Access**: Navigate to `/admin` (Access is restricted to users with the `admin` role in the `profiles` table).
