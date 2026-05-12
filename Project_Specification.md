# Project Specification: Personal Finance Budget App

## Executive Summary
A premium, personal finance and budget management application designed with a sharp fintech aesthetic. It allows users to manually log daily expenses, plan monthly budgets, and provides an AI-driven insights engine for financial health analysis. Built initially for personal use but architected securely from day one to scale into a public SaaS platform.

## User Stories
- As a user, I want to securely log in (via Email or OAuth) so that my financial data is protected.
- As a user, I want to manually log daily expenses so that I can track my spending against my monthly budget.
- As a user, I want to view visual breakdowns (e.g., pie charts) of my expenses so that I can easily understand my spending habits.
- As a user, I want to receive automated AI insights on my spending so that I can optimize my budget and improve my financial health.
- As a user, I want to ask an AI chatbot specific questions about my transaction history so that I can get instant, contextual financial analysis.
- As a user, I want standard and custom categories for my expenses, including AI-suggested categories, so that my tracking is accurate and adaptable.
- As a user, I want a premium glassmorphism UI with both dark and light modes so that managing my finances feels modern, engaging, and professional.

## Visual Design System
- **Theme Toggle**: Full support for both Light and Dark modes.
- **Light Mode**: Clean crisp whites, subtle grays, with deep navy or purple premium accents.
- **Dark Mode**: Obsidian black/deep charcoal background with vibrant emerald green (for positive flow) and electric blue (for charts and highlights) accents.
- **Visual Style**: Glassmorphism (frosted glass effects, translucent backgrounds with background blur), subtle gradients, crisp borders.
- **Font Family**: `Inter` (Clean, modern sans-serif).
- **Heading Sizes**: H1: 32px, H2: 24px, H3: 18px.
- **Body Size**: 14px / 16px.
- **Spacing Unit**: 8px (Standard utility scale).

## Component Inventory
1. **Auth Screens**: Login/Signup forms with OAuth buttons.
2. **Dashboard Layout**: Sidebar navigation, top header (theme toggle, user profile), main content canvas.
3. **Expense Entry Form (Modal/Drawer)**: Inputs for Amount, Date, Category (dropdown with fixed/custom/AI-suggested options), and Description.
4. **Analytics Widget**: Pie charts and bar graphs displaying spending breakdowns and budget utilization.
5. **AI Summary Card**: Automated text-based insights summarizing financial health generated on the fly.
6. **AI Chat Interface**: A chatbot side-panel or widget for querying financial history conversationally.
7. **Transaction Ledger**: Data table with transaction history, sorting, and filtering capabilities.

## Interaction Map
| Element | Action | Result |
|---------|--------|--------|
| Add Expense Button | Click | Opens Expense Entry Modal/Drawer |
| Expense Form Submit | Click | Validates inputs, shows loading state, saves to database, updates UI optimistically |
| Theme Toggle | Click | Switches UI between Light and Dark mode instantly, persisting in user preferences |
| AI Chat Input | Submit | Sends query context to AI backend, displays loading indicator, streams response |
| Category Dropdown | Select | Choose existing category or triggers "Create New Category" sub-flow |

## Technical Architecture & API Contract
- **Frontend**: Next.js (React), Tailwind CSS (for styling and glassmorphism utilities), Recharts (for data visualization).
- **Backend & Database**: Supabase (PostgreSQL) for relational data mapping, Row Level Security (RLS) for multi-tenant data isolation.
- **AI Integration**: Integration with an LLM provider (e.g., OpenAI or Anthropic API via Next.js Serverless Functions) for generating insights and chat.

| Endpoint / RPC | Method | Request Body | Response |
|--------------|--------|---------|----------|
| `/api/expenses` (Supabase) | POST | `{ amount, date, category_id, description }` | `{ id, created_at, ... }` |
| `/api/expenses` (Supabase) | GET | `?user_id=XX&month=XX` | `[{...}, {...}]` |
| `/api/ai/insights` | POST | `{ user_data_context }` | `{ summary_text: "..." }` |
| `/api/ai/chat` | POST | `{ query, context, history }` | `{ reply: "..." }` |

## Acceptance Criteria
- [ ] **Auth**: User can securely authenticate via Supabase Auth and view only their isolated data.
- [ ] **Data Entry**: User can log an expense with required fields, categorize it flexibly, and see it reflect in the UI immediately.
- [ ] **Aesthetics**: UI perfectly matches the "premium fintech glassmorphism" aesthetic with responsive design across devices.
- [ ] **Theme**: User can toggle between Light and Dark modes.
- [ ] **Visualization**: User can view an accurate visual representation (pie chart) of their current monthly expenses vs income.
- [ ] **AI Automation**: User receives an automated AI insight based on their recent transaction history upon dashboard load.
- [ ] **AI Chat**: User can interact with the AI chatbot to ask a financial question and receive a mathematically sound and relevant answer.
