# 🧠 DailyFuel — Product Specification

DailyFuel is a minimalist challenge-based app where users can create and join **X-day challenges** to build habits and stay accountable. This document outlines the product vision, user flows, feature list, and the database schema to support MVP development.

---

## 1. 🧾 What is DailyFuel?

DailyFuel helps people build consistency by joining simple, day-based challenges (like "30 days of writing", "14 days of workouts", etc.). 

### 👥 Who can use it?

- **Logged-in users** can join challenges via shared links.
- **Subscribers** can create their own challenges and share them.
- **No one** can browse a global challenge feed yet — joining happens only via link.

### 💰 Business model

- Users must **subscribe** to create challenges.
- Subscriptions:
  - $6/month
  - $54/year (3 months free)
- Subscription is handled via **Stripe Checkout**.
- Users can join challenges **for free**.

---

## 2. 🔁 App Flows

### 🔐 Authentication Flow
- User logs in via **magic link** or **Google Auth** (Supabase default from ShipFast)
- No passwords.

---

### 📥 Join Challenge Flow
1. Creator shares a challenge link (`/challenge/[id]`)
2. Visitor opens the link
3. If not logged in → prompted to log in
4. After login → automatically joined
5. User can start tracking daily progress

---

### 🧑‍💻 Create Challenge Flow
1. Subscriber clicks “Create Challenge”
2. Fills form: title, description, duration, daily goal
3. Challenge is saved to DB
4. Shareable link is shown (`/challenge/[id]`)

---

### ✅ Daily Progress Flow
1. User opens `/challenge/[id]`
2. Sees current streak, completed days
3. Clicks a checkbox or button to mark the current day complete
4. UI updates progress (e.g. calendar, counter, progress bar)

---

### 💳 Subscription Flow
1. User clicks “Upgrade”
2. Redirected to Stripe Checkout
3. On payment success:
   - Stripe webhook updates user row in Supabase
   - Sets `is_subscriber = true`, stores `subscription_status`, etc.
4. User redirected to `/dashboard`

---

## 3. ✨ Features

### ✅ Core Features

| Feature                | Free Users | Subscribers |
|------------------------|------------|-------------|
| Join challenges        | ✅         | ✅          |
| Track daily progress   | ✅         | ✅          |
| View joined challenges | ✅         | ✅          |
| Create challenges      | ❌         | ✅          |
| View created stats     | ❌         | ✅ (basic)  |

---

### 📄 Pages

| Route                | Description                                               |
|----------------------|-----------------------------------------------------------|
| `/`                  | Landing page + pricing info + login                       |
| `/dashboard`         | Home after login (joined + created challenges)            |
| `/create`            | Challenge creation form (subscribers only)                |
| `/challenge/[id]`    | Challenge view page with join/progress logic              |
| `/profile`           | User profile, subscription status, streak history         |
| `/upgrade`           | Stripe checkout redirection for payment                   |

---

## 4. 🧱 Database Schema (Supabase)

All tables use UUIDs as primary keys.

---

### 🔸 `users`

| Field               | Type      | Notes                          |
|---------------------|-----------|--------------------------------|
| `id`                | uuid      | Supabase auth user ID (PK)     |
| `email`             | text      | From Supabase auth             |
| `is_subscriber`     | boolean   | True if paid user              |
| `stripe_customer_id`| text      | Set after Stripe checkout      |
| `subscription_status`| text     | e.g. "active", "canceled"      |
| `current_period_end`| timestamp | End of current billing period  |
| `created_at`        | timestamp | Default now()                  |

---

### 🔸 `challenges`

| Field         | Type    | Notes                             |
|---------------|---------|-----------------------------------|
| `id`          | uuid    | Primary key                       |
| `creator_id`  | uuid    | FK to `users.id`                  |
| `title`       | text    | Challenge title                   |
| `description` | text    | Optional long text                |
| `daily_goal`  | text    | What user is expected to do daily |
| `duration_days`| int    | 7, 14, 30, etc.                   |
| `start_date`  | date    | When challenge begins             |
| `created_at`  | timestamp | Default now()                  |

---

### 🔸 `challenge_participants`

| Field         | Type    | Notes                          |
|---------------|---------|--------------------------------|
| `id`          | uuid    | Primary key                    |
| `challenge_id`| uuid    | FK to `challenges.id`          |
| `user_id`     | uuid    | FK to `users.id`               |
| `joined_at`   | timestamp | Default now()               |

---

### 🔸 `daily_logs`

| Field         | Type    | Notes                          |
|---------------|---------|--------------------------------|
| `id`          | uuid    | Primary key                    |
| `challenge_id`| uuid    | FK to `challenges.id`          |
| `user_id`     | uuid    | FK to `users.id`               |
| `date`        | date    | Day completed by user          |

---

## 5. ⚠️ MVP Limits

- No edit/delete of challenges for now
- No global feed — all joining via shared links
- No analytics beyond basic progress stats
- No notification/reminder system (can be added later)

---

## 6. 📦 Tech Stack

- **Frontend**: Next.js (via ShipFast)
- **Auth & DB**: Supabase
- **Payments**: Stripe (Checkout + Webhooks)
- **Hosting**: Vercel (default for ShipFast)