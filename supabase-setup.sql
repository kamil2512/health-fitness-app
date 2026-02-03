-- Health & Fitness App Database Setup
-- Copy and paste this entire file into Supabase SQL Editor

-- Enable Row Level Security (RLS)
-- This ensures users can only see their own data

-- 1. PROFILES TABLE
-- Stores user profile information and health metrics
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Basic Info
  name TEXT,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),

  -- Physical Metrics
  weight_kg DECIMAL(5,2),
  height_cm DECIMAL(5,2),

  -- Health Metrics (optional)
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  blood_sugar DECIMAL(5,2),
  health_conditions TEXT[], -- array of conditions

  -- Goals
  goal_weight_kg DECIMAL(5,2),
  goal_type TEXT CHECK (goal_type IN ('lose', 'gain', 'maintain', 'health')),

  -- Preferences
  diet_type TEXT CHECK (diet_type IN ('regular', 'vegetarian', 'vegan')),
  allergies TEXT[], -- array of food allergies
  cuisine_preferences TEXT[], -- preferred cuisines
  equipment TEXT CHECK (equipment IN ('none', 'home', 'gym')),

  -- Schedule
  wake_time TIME,
  sleep_time TIME,
  work_start TIME,
  work_end TIME,

  -- Location
  country TEXT,
  city TEXT
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. RECIPES TABLE
-- Stores AI-generated recipes
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Recipe Details
  name TEXT NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL, -- [{name: "chicken", amount: "200g", cost: 3.50}, ...]
  instructions JSONB NOT NULL, -- ["Step 1...", "Step 2...", ...]

  -- Nutritional Info
  calories INTEGER,
  protein_g DECIMAL(5,2),
  carbs_g DECIMAL(5,2),
  fat_g DECIMAL(5,2),

  -- Additional Info
  prep_time_mins INTEGER,
  cook_time_mins INTEGER,
  servings INTEGER DEFAULT 1,
  estimated_cost_usd DECIMAL(6,2),
  estimated_cost_local DECIMAL(6,2),
  currency TEXT,

  -- Classification
  diet_type TEXT CHECK (diet_type IN ('regular', 'vegetarian', 'vegan')),
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),

  -- Media
  image_url TEXT
);

-- Enable RLS on recipes
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own recipes
CREATE POLICY "Users can view own recipes"
  ON recipes FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own recipes
CREATE POLICY "Users can insert own recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own recipes
CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- 3. MEAL PLANS TABLE
-- Links recipes to specific dates and meal times
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  date DATE NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,

  -- Tracking
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,

  UNIQUE(user_id, date, meal_type)
);

-- Enable RLS on meal_plans
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meal plans"
  ON meal_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal plans"
  ON meal_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal plans"
  ON meal_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal plans"
  ON meal_plans FOR DELETE
  USING (auth.uid() = user_id);

-- 4. WORKOUT PLANS TABLE
-- Stores workout schedules
CREATE TABLE IF NOT EXISTS workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  date DATE NOT NULL,

  -- Workout Details
  name TEXT NOT NULL,
  exercises JSONB NOT NULL, -- [{name: "Push-ups", sets: 3, reps: 10, rest: "60s"}, ...]
  duration_mins INTEGER,
  equipment_needed TEXT CHECK (equipment_needed IN ('none', 'home', 'gym')),
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),

  -- Additional Info
  warmup JSONB, -- warm-up exercises
  cooldown JSONB, -- cool-down exercises
  notes TEXT,

  -- Tracking
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,

  UNIQUE(user_id, date)
);

-- Enable RLS on workout_plans
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workouts"
  ON workout_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
  ON workout_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON workout_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON workout_plans FOR DELETE
  USING (auth.uid() = user_id);

-- 5. WEIGHT LOG TABLE
-- Tracks weight changes over time
CREATE TABLE IF NOT EXISTS weight_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  date DATE NOT NULL,
  weight_kg DECIMAL(5,2) NOT NULL,
  notes TEXT,

  UNIQUE(user_id, date)
);

-- Enable RLS on weight_log
ALTER TABLE weight_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weight logs"
  ON weight_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight logs"
  ON weight_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight logs"
  ON weight_log FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight logs"
  ON weight_log FOR DELETE
  USING (auth.uid() = user_id);

-- 6. CREATE INDEXES for better performance
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON meal_plans(user_id, date);
CREATE INDEX IF NOT EXISTS idx_workout_plans_user_date ON workout_plans(user_id, date);
CREATE INDEX IF NOT EXISTS idx_weight_log_user_date ON weight_log(user_id, date);
CREATE INDEX IF NOT EXISTS idx_recipes_user ON recipes(user_id);

-- 7. CREATE FUNCTION to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. CREATE TRIGGER to auto-update updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Database setup complete! All tables created successfully.';
END $$;
