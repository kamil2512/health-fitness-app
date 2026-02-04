# FitLife - Product Document

**Version:** 1.0
**Last Updated:** February 5, 2026
**Live URL:** https://health-fitness-app-beta.vercel.app
**Repository:** https://github.com/kamil2512/health-fitness-app

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Tech Stack](#2-tech-stack)
3. [Features Overview](#3-features-overview)
4. [Application Pages](#4-application-pages)
5. [API Endpoints](#5-api-endpoints)
6. [Database Schema](#6-database-schema)
7. [AI Integration](#7-ai-integration)
8. [Design System](#8-design-system)
9. [Security](#9-security)
10. [Environment Variables](#10-environment-variables)
11. [File Structure](#11-file-structure)

---

## 1. Executive Summary

**FitLife** is an AI-powered health and fitness web application that generates personalized meal plans and workout routines based on user health metrics, goals, and daily schedules.

### Key Differentiators

- **Location-Aware Meal Planning:** Suggests recipes using ingredients actually available in the user's city/country with local pricing
- **Schedule-Smart Workouts:** Analyzes wake time, sleep time, and work hours to suggest optimal workout times that never conflict with the user's schedule
- **Health-Conscious AI:** Automatically adjusts recommendations for users with high blood pressure (low sodium) or elevated blood sugar (low glycemic index)

### Target Users

- People looking to lose, gain, or maintain weight
- Users who want personalized meal plans without generic ingredients
- Fitness beginners who need guided workout routines
- Health-conscious individuals tracking weight progress

---

## 2. Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.6 | React framework with App Router |
| React | 19.2.3 | UI library |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Utility-first styling |

### Backend & Database
| Technology | Purpose |
|------------|---------|
| Supabase | PostgreSQL database + Authentication |
| Row Level Security (RLS) | Data isolation per user |

### AI
| Technology | Purpose |
|------------|---------|
| OpenRouter API | AI gateway |
| Google Gemini 2.0 Flash Lite | Content generation model |

### Deployment
| Service | Purpose |
|---------|---------|
| Vercel | Hosting & CI/CD |
| GitHub | Version control |

---

## 3. Features Overview

### 3.1 Authentication
- Email/password signup and login
- Secure session management with cookies
- Auto-redirect for authenticated/unauthenticated users
- Sign out from profile page

### 3.2 User Onboarding (6-Step Wizard)
1. **Basic Info** - Name, age, gender, weight, height
2. **Health Metrics** - Blood pressure, blood sugar (optional)
3. **Goals** - Target weight, goal type (lose/gain/maintain/health)
4. **Schedule** - Wake time, sleep time, work hours
5. **Preferences** - Diet type, gym equipment available
6. **Location** - Country, city (for ingredient pricing)

### 3.3 AI Meal Generation
- Generates breakfast, lunch, and dinner in parallel
- Uses locally available ingredients based on user's city
- Respects diet type (regular/vegetarian/vegan)
- Avoids allergens
- Adjusts for health conditions:
  - High blood pressure → low sodium
  - High blood sugar → low glycemic index
- Provides:
  - Recipe name and description
  - Ingredient list with local pricing
  - Step-by-step cooking instructions
  - Nutritional breakdown (calories, protein, carbs, fat)
  - Prep time estimate

### 3.4 AI Workout Generation
- Analyzes user's daily schedule
- Calculates free time windows (before/after work)
- Suggests optimal workout time
- Never schedules before wake time or during work hours
- Adapts to available equipment:
  - None → bodyweight exercises
  - Home → dumbbells, resistance bands
  - Gym → full equipment
- Goal-specific programming:
  - Lose weight → cardio + HIIT
  - Gain muscle → strength training
  - Maintain → balanced routine
- Includes warmup, exercises (sets/reps/rest), and cooldown

### 3.5 Weight Tracking
- Log daily weight (kg)
- Optional notes per entry
- Visual line chart (last 30 entries)
- Goal weight line displayed on chart
- History table (up to 90 days)

### 3.6 Meal History
- Timeline grouped by date
- Summary stats: total meals, days tracked, avg daily calories
- Color-coded meal types (breakfast/lunch/dinner/snack)
- Completion status tracking
- Links to full recipe details

### 3.7 Workout History
- Card grid of all workouts
- Summary stats: total, completed, completion rate, avg duration
- Difficulty badges (beginner/intermediate/advanced)
- Completion status (done/pending)
- Links to full workout details with interactive checklist

### 3.8 Profile Management
- View/edit toggle
- Update personal info, goals, preferences, schedule, location
- BMI auto-calculation
- Sign out button

---

## 4. Application Pages

### Public Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page with features and CTA |
| `/login` | User sign in |
| `/signup` | Account creation |

### Protected Pages (Require Auth)

| Route | Purpose |
|-------|---------|
| `/onboarding` | 6-step profile setup wizard |
| `/dashboard` | Main hub with daily plan overview |
| `/meals` | Meal history timeline |
| `/workouts` | Workout history grid |
| `/weight-log` | Weight tracking with chart |
| `/profile` | View/edit user profile |
| `/recipe/[id]` | Full recipe detail page |
| `/workout/[id]` | Full workout detail with exercise checklist |

---

## 5. API Endpoints

### POST `/api/generate-meals`

Generates AI-powered meal plans for breakfast, lunch, and dinner.

**Request:**
```json
{
  "userId": "uuid"
}
```

**Response:**
```json
{
  "meals": [
    {
      "id": "uuid",
      "name": "Recipe Name",
      "description": "Description",
      "calories": 500,
      "protein_g": 25,
      "carbs_g": 50,
      "fat_g": 15,
      "prep_time_mins": 20,
      "meal_type": "breakfast",
      "ingredients": [...],
      "instructions": [...]
    }
  ]
}
```

### POST `/api/generate-workout`

Generates AI-powered workout plan.

**Request:**
```json
{
  "userId": "uuid"
}
```

**Response:**
```json
{
  "workout": {
    "id": "uuid",
    "name": "Workout Name",
    "duration_mins": 40,
    "difficulty": "intermediate",
    "best_time": "07:00 AM",
    "exercises": [...],
    "warmup": [...],
    "cooldown": [...]
  }
}
```

### GET `/api/weight-log`

Fetches user's weight log entries (last 90 days).

**Response:**
```json
{
  "entries": [
    {
      "id": "uuid",
      "date": "2026-02-05",
      "weight_kg": 70.5,
      "notes": "Morning weigh-in"
    }
  ]
}
```

### POST `/api/weight-log`

Creates or updates a weight entry.

**Request:**
```json
{
  "weight_kg": 70.5,
  "date": "2026-02-05",
  "notes": "Morning weigh-in"
}
```

---

## 6. Database Schema

### `profiles`
Stores user profile information and health metrics.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (references auth.users) |
| name | TEXT | User's name |
| age | INTEGER | Age in years |
| gender | TEXT | male, female, other |
| weight_kg | DECIMAL(5,2) | Current weight |
| height_cm | DECIMAL(5,2) | Height |
| blood_pressure_systolic | INTEGER | Optional |
| blood_pressure_diastolic | INTEGER | Optional |
| blood_sugar | DECIMAL(5,2) | Optional (mg/dL) |
| goal_weight_kg | DECIMAL(5,2) | Target weight |
| goal_type | TEXT | lose, gain, maintain, health |
| diet_type | TEXT | regular, vegetarian, vegan |
| allergies | TEXT[] | Food allergies |
| equipment | TEXT | none, home, gym |
| wake_time | TIME | Daily wake time |
| sleep_time | TIME | Daily sleep time |
| work_start | TIME | Optional |
| work_end | TIME | Optional |
| country | TEXT | User's country |
| city | TEXT | User's city |

### `recipes`
Stores AI-generated recipes.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner |
| name | TEXT | Recipe name |
| description | TEXT | Brief description |
| ingredients | JSONB | [{name, amount, cost}] |
| instructions | JSONB | ["Step 1", "Step 2"] |
| calories | INTEGER | Total calories |
| protein_g | DECIMAL | Protein in grams |
| carbs_g | DECIMAL | Carbs in grams |
| fat_g | DECIMAL | Fat in grams |
| prep_time_mins | INTEGER | Prep time |
| estimated_cost_local | DECIMAL | Cost in local currency |
| currency | TEXT | Currency code |
| diet_type | TEXT | Diet compatibility |
| meal_type | TEXT | breakfast, lunch, dinner, snack |

### `meal_plans`
Links recipes to dates.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner |
| date | DATE | Plan date |
| meal_type | TEXT | Meal type |
| recipe_id | UUID | References recipes |
| completed | BOOLEAN | Completion status |

**Constraint:** UNIQUE(user_id, date, meal_type)

### `workout_plans`
Stores workout schedules.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner |
| date | DATE | Workout date |
| name | TEXT | Workout name |
| exercises | JSONB | [{name, sets, reps, rest, notes}] |
| duration_mins | INTEGER | Total duration |
| difficulty | TEXT | beginner, intermediate, advanced |
| warmup | JSONB | [{exercise, duration}] |
| cooldown | JSONB | [{exercise, duration}] |
| notes | TEXT | Additional notes |
| completed | BOOLEAN | Completion status |

**Constraint:** UNIQUE(user_id, date)

### `weight_log`
Tracks weight over time.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner |
| date | DATE | Entry date |
| weight_kg | DECIMAL(5,2) | Weight |
| notes | TEXT | Optional notes |

**Constraint:** UNIQUE(user_id, date)

---

## 7. AI Integration

### Model
- **Provider:** OpenRouter API
- **Model:** Google Gemini 2.0 Flash Lite (`google/gemini-2.0-flash-lite-001`)
- **Max Tokens:** 1024
- **Timeout:** 5 minutes

### Meal Generation Prompt Strategy

**System Prompt:**
- Role: Professional nutritionist and local chef from user's city
- Expertise: Local markets, seasonal produce, regional staples
- Rules: Only use locally available ingredients, realistic pricing

**User Prompt:**
- Chain-of-thought reasoning:
  1. Consider locally available ingredients
  2. Filter by diet type and goal
  3. Build recipe using local ingredients
  4. Calculate macros and pricing
- Calorie targets by goal:
  - Lose: 300-500 cal/meal
  - Gain: 500-800 cal/meal
  - Maintain: 400-600 cal/meal
- Health constraints clearly marked as CRITICAL

### Workout Generation Prompt Strategy

**System Prompt:**
- Role: Certified personal trainer
- Critical scheduling rules (never violated):
  - Workout AFTER wake time
  - Workout BEFORE sleep time
  - No overlap with work hours
  - 30+ min buffer after waking
- Pre-calculated free time windows provided

**User Prompt:**
- Chain-of-thought reasoning:
  1. Calculate free time windows
  2. Pick best window for 30-45 min workout
  3. Verify time validity
  4. Design exercises for goal/equipment
- Goal-specific focus:
  - Lose → cardio/HIIT
  - Gain → strength training
  - Maintain → balanced

---

## 8. Design System

### Colors

| Name | Hex | Usage |
|------|-----|-------|
| Background | #FAFAF8 | Page background (off-white) |
| Foreground | #111827 | Primary text (soft black) |
| Primary | #10b981 | Accent, success, active states (emerald) |
| Secondary | #f59e0b | Warnings, highlights (amber) |
| Dark | #0D0F11 | Buttons, headers (near black) |
| Card | #FFFFFF | Card backgrounds |
| Border | #E5E7EB | Borders, dividers |
| Text Secondary | #6B7280 | Muted text |

### Typography

| Element | Font | Weight |
|---------|------|--------|
| Headings | Plus Jakarta Sans | 800 (extrabold) |
| Body | DM Sans | 400-600 |

### Components

**Cards:**
- Background: White
- Border: 1px solid #E5E7EB
- Border radius: 16px
- Shadow: Subtle multi-layer
- Hover: -4px translateY + shadow

**Buttons:**
- Primary: #0D0F11 bg, white text
- Secondary: Border only, transparent bg
- Border radius: 12px

**Badges/Pills:**
- Rounded full
- Color-coded by type
- 10px font, bold, uppercase

---

## 9. Security

### Row Level Security (RLS)
All tables have RLS enabled. Policies ensure users can only:
- SELECT their own data
- INSERT their own data
- UPDATE their own data
- DELETE their own data

### Authentication
- Supabase Auth handles password hashing
- Session cookies via @supabase/ssr
- Server-side auth checks in API routes
- Client-side checks redirect unauthorized users

### Data Validation
- TypeScript types for all data structures
- Database constraints (CHECK, UNIQUE, NOT NULL)
- Frontend form validation
- API error handling with proper status codes

---

## 10. Environment Variables

Create a `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI (OpenRouter)
OPENROUTER_API_KEY=your_openrouter_api_key
```

**Note:** These must also be configured in Vercel dashboard for production deployment.

---

## 11. File Structure

```
health-fitness-app/
├── app/
│   ├── api/
│   │   ├── generate-meals/route.ts    # Meal generation API
│   │   ├── generate-workout/route.ts  # Workout generation API
│   │   └── weight-log/route.ts        # Weight log CRUD
│   ├── components/
│   │   └── Navbar.tsx                 # Global navigation
│   ├── dashboard/page.tsx             # Main dashboard
│   ├── login/page.tsx                 # Sign in
│   ├── signup/page.tsx                # Sign up
│   ├── onboarding/page.tsx            # Profile setup wizard
│   ├── meals/page.tsx                 # Meal history
│   ├── workouts/page.tsx              # Workout history
│   ├── profile/page.tsx               # Profile management
│   ├── weight-log/page.tsx            # Weight tracking
│   ├── recipe/[id]/page.tsx           # Recipe detail
│   ├── workout/[id]/page.tsx          # Workout detail
│   ├── layout.tsx                     # Root layout
│   ├── page.tsx                       # Landing page
│   └── globals.css                    # Global styles
├── lib/
│   ├── ai.ts                          # AI prompt logic
│   ├── supabase.ts                    # Client-side Supabase
│   └── supabase-server.ts             # Server-side Supabase
├── public/                            # Static assets
├── supabase-setup.sql                 # Database schema
├── package.json                       # Dependencies
├── tsconfig.json                      # TypeScript config
└── next.config.ts                     # Next.js config
```

---

## Appendix: Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

**Document maintained by:** Kamil
**Built with:** Claude Opus 4.5
