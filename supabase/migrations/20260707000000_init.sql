-- Create tables matching Prisma design

CREATE TABLE IF NOT EXISTS public."Profile" (
    "id" UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    "fullName" TEXT NOT NULL,
    "occupation" TEXT,
    "publicIdentifier" TEXT,
    "profileUrl" TEXT,
    "avatarUrl" TEXT,
    "encryptedLiAt" TEXT,
    "encryptedJsessionid" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public."Post" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "profileId" UUID NOT NULL REFERENCES public."Profile"("id") ON DELETE CASCADE,
    "activityUrn" TEXT UNIQUE NOT NULL,
    "text" TEXT,
    "postUrl" TEXT,
    "postedRelative" TEXT,
    "numLikes" INTEGER DEFAULT 0 NOT NULL,
    "numComments" INTEGER DEFAULT 0 NOT NULL,
    "numShares" INTEGER DEFAULT 0 NOT NULL,
    "numImpressions" INTEGER DEFAULT 0 NOT NULL,
    "engagementScore" INTEGER DEFAULT 0 NOT NULL,
    "engagementRate" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    "reactionBreakdown" JSONB,
    "rank" INTEGER DEFAULT 0 NOT NULL,
    "postType" TEXT DEFAULT 'text'::text NOT NULL,
    "hashtags" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
    "mentions" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public."Analytics" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "profileId" UUID NOT NULL REFERENCES public."Profile"("id") ON DELETE CASCADE,
    "postsCount" INTEGER DEFAULT 0 NOT NULL,
    "totalLikes" INTEGER DEFAULT 0 NOT NULL,
    "totalComments" INTEGER DEFAULT 0 NOT NULL,
    "totalShares" INTEGER DEFAULT 0 NOT NULL,
    "totalImpressions" INTEGER DEFAULT 0 NOT NULL,
    "averageLikes" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    "averageComments" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    "averageShares" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    "averageImpressions" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    "averageEngagementRate" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    "topHashtags" JSONB,
    "topMentions" JSONB,
    "insights" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public."RefreshHistory" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "profileId" UUID NOT NULL REFERENCES public."Profile"("id") ON DELETE CASCADE,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "postsFetched" INTEGER DEFAULT 0 NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public."Settings" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "profileId" UUID UNIQUE NOT NULL REFERENCES public."Profile"("id") ON DELETE CASCADE,
    "theme" TEXT DEFAULT 'dark'::text NOT NULL,
    "autoRefresh" BOOLEAN DEFAULT false NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing
CREATE INDEX IF NOT EXISTS "idx_post_profileId" ON public."Post"("profileId");
CREATE INDEX IF NOT EXISTS "idx_post_activityUrn" ON public."Post"("activityUrn");
CREATE INDEX IF NOT EXISTS "idx_analytics_profileId" ON public."Analytics"("profileId");
CREATE INDEX IF NOT EXISTS "idx_refreshHistory_profileId" ON public."RefreshHistory"("profileId");

-- Enable Row Level Security (RLS)
ALTER TABLE public."Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Analytics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."RefreshHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Settings" ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can select own profile" ON public."Profile" FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public."Profile" FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public."Profile" FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can select own posts" ON public."Post" FOR SELECT USING (auth.uid() = "profileId");
CREATE POLICY "Users can modify own posts" ON public."Post" FOR ALL USING (auth.uid() = "profileId");

CREATE POLICY "Users can select own analytics" ON public."Analytics" FOR SELECT USING (auth.uid() = "profileId");
CREATE POLICY "Users can modify own analytics" ON public."Analytics" FOR ALL USING (auth.uid() = "profileId");

CREATE POLICY "Users can select own refresh history" ON public."RefreshHistory" FOR SELECT USING (auth.uid() = "profileId");
CREATE POLICY "Users can modify own refresh history" ON public."RefreshHistory" FOR ALL USING (auth.uid() = "profileId");

CREATE POLICY "Users can select/modify own settings" ON public."Settings" FOR ALL USING (auth.uid() = "profileId");

-- Supabase Auth trigger to automatically copy profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public."Profile" (id, "fullName", "occupation", "profileUrl", "createdAt", "updatedAt")
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.email),
        '',
        '',
        now(),
        now()
    );
    
    INSERT INTO public."Settings" (id, "profileId", "theme", "autoRefresh", "createdAt", "updatedAt")
    VALUES (
        gen_random_uuid(),
        new.id,
        'dark',
        false,
        now(),
        now()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
