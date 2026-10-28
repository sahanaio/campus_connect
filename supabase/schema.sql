-- =====================================================================
-- CampusConnect - Database Schema & Supabase Configuration
-- Department of Computer Science & Engineering (AIML), REVA University
-- Semester-End Project Evaluation
-- =====================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Stores student & admin academic parameters)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
    branch TEXT CHECK (branch IN ('CSE', 'AIML', 'ISE', 'ECE', 'MEC', 'CIV')),
    semester INT CHECK (semester BETWEEN 1 AND 8),
    cgpa NUMERIC(4, 2) CHECK (cgpa BETWEEN 0.0 AND 10.0),
    backlogs INT DEFAULT 0 CHECK (backlogs >= 0),
    skills TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. OPPORTUNITIES TABLE (Listing covering all 6 categories)
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('internships', 'hackathons', 'workshops', 'certifications', 'scholarships', 'part-time')),
    title TEXT NOT NULL,
    organizer TEXT NOT NULL,
    location TEXT DEFAULT 'REVA Campus, Bengaluru',
    stipend TEXT,
    duration TEXT,
    deadline DATE NOT NULL,
    link TEXT NOT NULL,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ELIGIBILITY RULES TABLE (Structured multi-criteria JSONB)
CREATE TABLE IF NOT EXISTS public.eligibility_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID UNIQUE NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    min_cgpa NUMERIC(4, 2) DEFAULT 0.0,
    semesters INT[] DEFAULT '{1,2,3,4,5,6,7,8}',
    branches TEXT[] DEFAULT '{AIML,CSE}',
    max_backlogs INT DEFAULT 0,
    required_skills TEXT[] DEFAULT '{}',
    raw_rules JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SAVED OPPORTUNITIES TABLE (Student bookmarks & tracking)
CREATE TABLE IF NOT EXISTS public.saved_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, opportunity_id)
);

-- 5. NOTIFICATIONS TABLE (In-app alerts & cron deadline reminders)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('deadline', 'new_match', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON public.opportunities(type);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON public.opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_notifications_student ON public.notifications(student_id, is_read);
CREATE INDEX IF NOT EXISTS idx_saved_student ON public.saved_opportunities(student_id);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view profiles, users can update only their own profile
CREATE POLICY "Public profiles can be viewed by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Opportunities: All users can view, only admins can create, update, delete
CREATE POLICY "All authenticated users can view opportunities"
    ON public.opportunities FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can insert opportunities"
    ON public.opportunities FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Only admins can update opportunities"
    ON public.opportunities FOR UPDATE
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Only admins can delete opportunities"
    ON public.opportunities FOR DELETE
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Eligibility rules: All users can view, admins can manage
CREATE POLICY "All authenticated users can view eligibility rules"
    ON public.eligibility_rules FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage eligibility rules"
    ON public.eligibility_rules FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Saved Opportunities: Students can only read and manage their own bookmarks
CREATE POLICY "Students can view only their saved opportunities"
    ON public.saved_opportunities FOR SELECT
    TO authenticated
    USING (student_id = auth.uid());

CREATE POLICY "Students can insert their own saved opportunities"
    ON public.saved_opportunities FOR INSERT
    TO authenticated
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can delete their own saved opportunities"
    ON public.saved_opportunities FOR DELETE
    TO authenticated
    USING (student_id = auth.uid());

-- Notifications: Students can only view and update their own notifications
CREATE POLICY "Students can view only their notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (student_id = auth.uid());

CREATE POLICY "Students can update read status on their notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (student_id = auth.uid());

