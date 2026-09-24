# EventEase – Smart Event & Party Management System

EventEase is a production-grade, full-stack event and party planning platform designed for managing weddings, birthday parties, corporate conferences, concerts, graduation galas, and private gatherings. It combines automated budgeting, real-time digital RSVP invitations, verified venue/vendor catalogs, task checklists, and an administrative control center.

---

## 🛠️ Technology Stack

- **Frontend**: React.js 18, Vite, JavaScript, Tailwind CSS, Lucide Icons, Recharts (Data Visualizations), Axios, Canvas Confetti.
- **Backend**: Python 3.13, Flask 3.0, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-CORS, PyMySQL, Cryptography, Werkzeug (Password Hashing).
- **Database**: MySQL / MariaDB (`eventease_db`).
- **Security**: JWT Bearer Authentication, Role-Based Access Control (`USER`, `ADMIN`), Salted Hash Password Security.

---

## 🚀 Key Features

### 👤 User / Event Organizer
- **Authentication**: JWT token-based signup, secure login, profile editor, and password changes.
- **17 Event Categories**: Birthday, Wedding, Engagement, Anniversary, Baby Shower, Naming Ceremony, Graduation, College Event, Corporate Event, Conference, Workshop, Concert, DJ/Music, Festival, Family Function, Private Party, Reunion.
- **Event Wizard**: Multi-step creation with dates, timings, locations, guest capacity, budget, and catalog venue selection.
- **Smart Budget Engine**:
  - Automatically calculates **Total Estimated Cost**, **Total Actual Cost**, **Remaining Budget**, and **Budget Usage %**.
  - Categorizes across: *Venue, Food/Catering, Decoration, Photography, Videography, Music/DJ, Invitations, Transportation, Other*.
- **Guest & RSVP Management**:
  - Add guests with contact details, relationship tags, and party headcounts.
  - Automatically updates counts for **Accepted**, **Pending**, and **Declined** RSVPs.
- **Digital Invitation Studio**:
  - Live preview card with customizable themes (*Royal Gold, Midnight Lavender, Emerald Botanical, Modern Rose*).
  - Generates a **Public Shareable RSVP Link** (`/invite/:code`) where invitees can RSVP without logging in.
- **Venues & Vendors Marketplace**:
  - Browse venues with capacity and price filters.
  - Explore catering chefs, photographers, DJs, makeup artists, and security bouncers.
  - One-click booking that links services to events and synchronizes expense ledgers.
- **Event Checklist**: Interactive task milestones with completion status tracking.
- **Organizer Dashboard**: Visual KPI cards, recent events feed, and 4 interactive Recharts charts.

### 🛡️ Administrator Portal
- **Admin Dashboard**: System-wide analytics (Total Users, Events, Budget Volume, Actual Platform Spend, RSVP headcounts).
- **User Management**: View user accounts, toggle active/deactivate status, and delete accounts.
- **Event Management**: Audit all platform events, view budgets, and change event lifecycle states (*Planning, Confirmed, Completed, Cancelled*).
- **Venue Catalog Management**: Add, edit, and delete venue entries with pricing, capacity, and facility tags.
- **Vendor Partner Management**: Register and edit verified vendor profiles across all 9 categories.
- **Feedback Moderation**: Monitor customer ratings and reviews.

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **System Admin** | `admin@eventease.com` | `Admin@123` | Full Admin Console (`/admin`) |
| **Organizer User** | `john@eventease.com` | `User@123` | User Dashboard & Event Hub |

*(Quick-fill buttons are also available directly on the login page for convenience)*

---

## 💻 Running the Application Locally

### 1. MySQL Database Setup
Ensure MySQL is running (e.g., via XAMPP MySQL daemon on port `3306`):
```sql
CREATE DATABASE IF NOT EXISTS eventease_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend (Flask)
```bash
cd backend
# Create virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server (boots on http://127.0.0.1:5000)
python run.py
```
*Note: The backend automatically migrates all 11 MySQL tables and seeds categories, sample venues, vendors, and demo events on first boot.*

### 3. Frontend (React + Vite)
```bash
cd frontend
# Install dependencies
npm install

# Start development server (boots on http://localhost:5173)
npm run dev
```

---

## 🗄️ Database Tables Schema

1. `users` – User accounts, hashed passwords, roles (`USER`, `ADMIN`), active status.
2. `event_categories` – 17 supported event types with icons and descriptions.
3. `venues` – Venue names, locations, capacities, prices, facilities, photos, and availability.
4. `vendors` – Service providers (Catering, Decor, Photo, Video, DJ, Makeup, Invitations, Transport, Security).
5. `events` – Core event records with dates, times, locations, guest limits, budget, and statuses.
6. `event_services` – Junction table linking booked vendors to specific events with agreed rates.
7. `guests` – Event invitees, relationships, party headcounts, and RSVP statuses (`Accepted`, `Pending`, `Declined`).
8. `expenses` – Budget ledger entries with estimated vs actual costs, payment statuses, and category tags.
9. `invitations` – Tokenized digital invitation links with theme templates and view tracking.
10. `event_checklists` – To-do milestones and deadlines per event.
11. `feedback` – Platform reviews and star ratings.
