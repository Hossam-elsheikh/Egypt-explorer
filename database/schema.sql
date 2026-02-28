-- ============================================================
-- EGYPT TOUR GUIDE - SUPABASE DATABASE SCHEMA
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE item_category AS ENUM (
  'place',
  'restaurant',
  'food',
  'drink',
  'service',
  'hotel',
  'activity'
);

CREATE TYPE item_status AS ENUM (
  'active',
  'inactive',
  'pending'
);

CREATE TYPE price_range AS ENUM (
  'budget',
  'moderate',
  'expensive',
  'luxury'
);

CREATE TYPE suggestion_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

-- ============================================================
-- PROFILES TABLE (extends auth.users)
-- ============================================================

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================

CREATE TABLE public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  type item_category NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LOCATIONS TABLE (Egyptian Governorates/Cities)
-- ============================================================

CREATE TABLE public.locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  governorate TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ITEMS TABLE (main content: places, food, drinks, services, etc.)
-- ============================================================

CREATE TABLE public.items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category item_category NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  location_id UUID REFERENCES public.locations(id),
  address TEXT,
  price_range price_range,
  min_price DECIMAL(10, 2),
  max_price DECIMAL(10, 2),
  currency TEXT DEFAULT 'EGP',
  image_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  opening_hours JSONB,
  contact_phone TEXT,
  contact_email TEXT,
  website TEXT,
  google_maps_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  status item_status DEFAULT 'active',
  is_featured BOOLEAN DEFAULT FALSE,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Index for faster queries
CREATE INDEX idx_items_category ON public.items(category);
CREATE INDEX idx_items_status ON public.items(status);
CREATE INDEX idx_items_location ON public.items(location_id);
CREATE INDEX idx_items_featured ON public.items(is_featured);
CREATE INDEX idx_items_slug ON public.items(slug);

-- ============================================================
-- RATINGS TABLE
-- ============================================================

CREATE TABLE public.ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_id, user_id)
);

CREATE TRIGGER update_ratings_updated_at
  BEFORE UPDATE ON public.ratings
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Trigger to update average_rating on items when rating changes
CREATE OR REPLACE FUNCTION public.update_item_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.items
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0) 
      FROM public.ratings 
      WHERE item_id = COALESCE(NEW.item_id, OLD.item_id)
    ),
    total_ratings = (
      SELECT COUNT(*) 
      FROM public.ratings 
      WHERE item_id = COALESCE(NEW.item_id, OLD.item_id)
    )
  WHERE id = COALESCE(NEW.item_id, OLD.item_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_rating_change
  AFTER INSERT OR UPDATE OR DELETE ON public.ratings
  FOR EACH ROW EXECUTE PROCEDURE public.update_item_rating();

-- ============================================================
-- COMMENTS TABLE
-- ============================================================

CREATE TABLE public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_flagged BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE INDEX idx_comments_item ON public.comments(item_id);

-- ============================================================
-- FAVORITES TABLE
-- ============================================================

CREATE TABLE public.favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

CREATE INDEX idx_favorites_user ON public.favorites(user_id);

-- ============================================================
-- SUGGESTIONS TABLE (tourists submit new places)
-- ============================================================

CREATE TABLE public.suggestions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category item_category NOT NULL,
  address TEXT,
  location_id UUID REFERENCES public.locations(id),
  price_range price_range,
  min_price DECIMAL(10, 2),
  max_price DECIMAL(10, 2),
  contact_phone TEXT,
  website TEXT,
  image_url TEXT,
  status suggestion_status DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_suggestions_updated_at
  BEFORE UPDATE ON public.suggestions
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Trigger: when suggestion is approved, create an item
CREATE OR REPLACE FUNCTION public.handle_suggestion_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    INSERT INTO public.items (
      title, description, category, location_id, address,
      price_range, min_price, max_price, image_url,
      status, created_by, slug
    ) VALUES (
      NEW.title,
      NEW.description,
      NEW.category,
      NEW.location_id,
      NEW.address,
      NEW.price_range,
      NEW.min_price,
      NEW.max_price,
      NEW.image_url,
      'active',
      NEW.reviewed_by,
      LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(NEW.id::TEXT, 1, 8)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_suggestion_approved
  AFTER UPDATE ON public.suggestions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_suggestion_approval();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- Helper: check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = user_id AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- PROFILES policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- CATEGORIES policies
CREATE POLICY "Categories are viewable by everyone" ON public.categories
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (is_admin(auth.uid()));

-- LOCATIONS policies
CREATE POLICY "Locations are viewable by everyone" ON public.locations
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage locations" ON public.locations
  FOR ALL USING (is_admin(auth.uid()));

-- ITEMS policies
CREATE POLICY "Active items are viewable by everyone" ON public.items
  FOR SELECT USING (status = 'active' OR is_admin(auth.uid()));

CREATE POLICY "Admins can manage all items" ON public.items
  FOR ALL USING (is_admin(auth.uid()));

-- RATINGS policies
CREATE POLICY "Ratings are viewable by everyone" ON public.ratings
  FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can add ratings" ON public.ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" ON public.ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings" ON public.ratings
  FOR DELETE USING (auth.uid() = user_id);

-- COMMENTS policies
CREATE POLICY "Approved comments are viewable by everyone" ON public.comments
  FOR SELECT USING (is_approved = TRUE OR auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Authenticated users can add comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users or admins can delete comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- FAVORITES policies
CREATE POLICY "Users can see own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can manage own favorites" ON public.favorites
  FOR ALL USING (auth.uid() = user_id);

-- SUGGESTIONS policies
CREATE POLICY "Users can view own suggestions" ON public.suggestions
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Authenticated users can create suggestions" ON public.suggestions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all suggestions" ON public.suggestions
  FOR ALL USING (is_admin(auth.uid()));

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

-- Create storage buckets (run these after enabling storage)
INSERT INTO storage.buckets (id, name, public) VALUES ('item-images', 'item-images', TRUE);
INSERT INTO storage.buckets (id, name, public) VALUES ('suggestion-images', 'suggestion-images', TRUE);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', TRUE);

-- Storage policies
CREATE POLICY "Item images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'item-images');

CREATE POLICY "Admins can upload item images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'item-images' AND is_admin(auth.uid()));

CREATE POLICY "Admins can update item images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'item-images' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete item images" ON storage.objects
  FOR DELETE USING (bucket_id = 'item-images' AND is_admin(auth.uid()));

CREATE POLICY "Suggestion images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'suggestion-images');

CREATE POLICY "Authenticated users can upload suggestion images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'suggestion-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Insert Locations
INSERT INTO public.locations (id, name, name_ar, governorate, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Cairo', 'القاهرة', 'Cairo', 'The vibrant capital of Egypt'),
  ('22222222-2222-2222-2222-222222222222', 'Luxor', 'الأقصر', 'Luxor', 'The world''s greatest open-air museum'),
  ('33333333-3333-3333-3333-333333333333', 'Aswan', 'أسوان', 'Aswan', 'Nubian culture and tranquil Nile'),
  ('44444444-4444-4444-4444-444444444444', 'Hurghada', 'الغردقة', 'Red Sea', 'Red Sea paradise'),
  ('55555555-5555-5555-5555-555555555555', 'Sharm El-Sheikh', 'شرم الشيخ', 'South Sinai', 'Sinai resort city'),
  ('66666666-6666-6666-6666-666666666666', 'Alexandria', 'الإسكندرية', 'Alexandria', 'The Pearl of the Mediterranean'),
  ('77777777-7777-7777-7777-777777777777', 'Dahab', 'دهب', 'South Sinai', 'Laid-back diving destination'),
  ('88888888-8888-8888-8888-888888888888', 'Siwa Oasis', 'سيوة', 'Matruh', 'Ancient oasis in the desert');

-- Insert Categories
INSERT INTO public.categories (name, slug, icon, type) VALUES
  ('Ancient Sites', 'ancient-sites', '🏛️', 'place'),
  ('Mosques & Churches', 'mosques-churches', '🕌', 'place'),
  ('Museums', 'museums', '🏛️', 'place'),
  ('Bazaars & Souks', 'bazaars-souks', '🛒', 'place'),
  ('Beaches & Resorts', 'beaches-resorts', '🏖️', 'place'),
  ('Nile Cruises', 'nile-cruises', '⛵', 'activity'),
  ('Desert Safari', 'desert-safari', '🐪', 'activity'),
  ('Diving & Snorkeling', 'diving-snorkeling', '🤿', 'activity'),
  ('Egyptian Cuisine', 'egyptian-cuisine', '🍽️', 'food'),
  ('Street Food', 'street-food', '🥙', 'food'),
  ('Seafood', 'seafood', '🦞', 'food'),
  ('Cafes & Tea Houses', 'cafes-tea', '☕', 'drink'),
  ('Juice Bars', 'juice-bars', '🥤', 'drink'),
  ('Hotels & Resorts', 'hotels-resorts', '🏨', 'hotel'),
  ('Tour Operators', 'tour-operators', '🗺️', 'service'),
  ('Spas & Wellness', 'spas-wellness', '💆', 'service');
