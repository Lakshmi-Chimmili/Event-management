import sys
import os

# Auto-redirect to backend virtual environment if executed with system Python
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
venv_python = os.path.join(backend_dir, 'venv', 'Scripts', 'python.exe')
if os.path.exists(venv_python) and sys.executable.lower() != os.path.abspath(venv_python).lower():
    try:
        import flask_jwt_extended
    except ImportError:
        os.execv(venv_python, [venv_python] + sys.argv)

# Ensure backend directory is in Python path for direct CLI execution & IDE linters
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.database import db
from app.models.user import User
from app.models.category import EventCategory
from app.models.venue import Venue
from app.models.vendor import Vendor
from app.models.event import Event
from app.models.guest import Guest
from app.models.expense import Expense
from app.models.checklist import Checklist
from app.models.invitation import Invitation
from datetime import datetime, date, time, timedelta


EVENT_CATEGORIES_DATA = [
    {"name": "Birthday Party", "slug": "birthday-party", "icon": "Cake", "description": "Joyous birthdays for all ages with custom themes and decor"},
    {"name": "Wedding", "slug": "wedding", "icon": "HeartHandshake", "description": "Dream weddings with exquisite arrangements, ceremonies, and reception"},
    {"name": "Engagement", "slug": "engagement", "icon": "Sparkles", "description": "Romantic ring ceremonies and couple celebrations"},
    {"name": "Anniversary", "slug": "anniversary", "icon": "GlassWater", "description": "Milestone anniversaries honoring memorable years of love"},
    {"name": "Baby Shower", "slug": "baby-shower", "icon": "Baby", "description": "Sweet and memorable celebrations for parents-to-be"},
    {"name": "Naming Ceremony", "slug": "naming-ceremony", "icon": "Smile", "description": "Traditional or modern naming rituals and feasts"},
    {"name": "Graduation Party", "slug": "graduation-party", "icon": "GraduationCap", "description": "Celebrations honoring academic achievements"},
    {"name": "College Event", "slug": "college-event", "icon": "School", "description": "Campus fests, talent nights, tech symposiums and sports meets"},
    {"name": "Corporate Event", "slug": "corporate-event", "icon": "Building2", "description": "Annual general meetings, product launches and galas"},
    {"name": "Conference", "slug": "conference", "icon": "Presentation", "description": "Keynote symposiums, summit panels and industry summits"},
    {"name": "Workshop", "slug": "workshop", "icon": "Briefcase", "description": "Interactive training, hands-on bootcamps and masterclasses"},
    {"name": "Concert", "slug": "concert", "icon": "Mic2", "description": "Live musical performances, bands, and acoustic nights"},
    {"name": "DJ / Music Event", "slug": "dj-music-event", "icon": "Disc3", "description": "High-energy EDM, club nights, and dance parties"},
    {"name": "Festival Event", "slug": "festival-event", "icon": "Flame", "description": "Cultural, seasonal, and holiday festivals"},
    {"name": "Family Function", "slug": "family-function", "icon": "Users", "description": "Housewarmings, get-togethers, and milestone rituals"},
    {"name": "Private Party", "slug": "private-party", "icon": "Wine", "description": "Exclusive gatherings, rooftop dinners, and VIP parties"},
    {"name": "Reunion", "slug": "reunion", "icon": "Clock", "description": "School, college, and family reconnects across years"}
]

SAMPLE_VENUES = [
    {
        "name": "The Grand Crystal Ballroom & Gardens",
        "location": "Downtown Metro Plaza, Silicon District",
        "capacity": 650,
        "price": 3200.00,
        "facilities": "Grand Stage, Banquet Hall, Central AC, Valet Parking, Private Bridal Suite, Lush Lawn, High-Speed WiFi, Surround Audio",
        "description": "A stunning luxury venue featuring European crystal chandeliers, floor-to-ceiling glass facades, and landscaped outdoor gardens ideal for weddings, galas, and mega-receptions.",
        "image_url": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
        "is_available": True
    },
    {
        "name": "Skyline Panorama Terrace & Lounge",
        "location": "Harbor View Tower 45th Floor",
        "capacity": 220,
        "price": 1800.00,
        "facilities": "Open-air Rooftop, Infinity Glass Deck, Premium Cocktail Bar, Ambient Lighting, DJ Booth, Elevator Access, Valet Parking",
        "description": "Perched on the 45th floor overlooking the vibrant city skyline and ocean sunset. Designed for cocktail parties, engagements, birthday bashes, and corporate mixers.",
        "image_url": "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
        "is_available": True
    },
    {
        "name": "Heritage Royal Palace & Courtyard",
        "location": "Old Royal Heritage Enclave",
        "capacity": 1000,
        "price": 4500.00,
        "facilities": "Ancient Stone Courtyards, Royal Pavilion, 200+ Car Parking, Vintage Illumination, Dressing Suites, Full Kitchen Setup",
        "description": "Regal architectural estate blending heritage charm with modern amenities. Perfect for lavish traditional weddings, cultural festivals, and monumental celebrations.",
        "image_url": "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&w=1200&q=80",
        "is_available": True
    },
    {
        "name": "Emerald Grove Botanical Oasis",
        "location": "Pine Valley Eco Estate",
        "capacity": 350,
        "price": 1400.00,
        "facilities": "Botanical Greenhouse, Natural Amphitheater, Gazebos, Eco-friendly Lighting, Restrooms, Outdoor Kitchen, Lawn Games Zone",
        "description": "Nestled in serene lush greenery with blooming floral gazebos and water bodies. Best for baby showers, daytime anniversaries, and bohemian birthday bashes.",
        "image_url": "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80",
        "is_available": True
    },
    {
        "name": "Nova Tech Convention & Expo Center",
        "location": "Innovation Park, Sector 9",
        "capacity": 800,
        "price": 2800.00,
        "facilities": "Dual 4K Laser Projection, Acoustic Soundproofing, Live Streaming Studio, Translation Booths, Dining Hall, Gig-speed Fiber",
        "description": "State-of-the-art auditorium and break-out pavilions engineered specifically for conferences, developer workshops, hackathons, and corporate summits.",
        "image_url": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80",
        "is_available": True
    },
    {
        "name": "Velvet Rhythm Club & Event Hall",
        "location": "Music District, West Avenue",
        "capacity": 400,
        "price": 2100.00,
        "facilities": "Pioneer DJ Console, Line-Array Sound Rig, Moving Head Beams, VIP Bottle Lounges, Smoke & Laser FX, Soundproof",
        "description": "Electrifying club venue built for concerts, DJ performances, youth graduation blowouts, and unforgettable dance nights.",
        "image_url": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
        "is_available": True
    }
]

SAMPLE_VENDORS = [
    # Catering
    {
        "name": "Royal Feast Gourmet Catering",
        "category": "Catering",
        "contact_name": "Chef Marcus Vance",
        "email": "chef.marcus@royalfeast.com",
        "phone": "+1 (555) 234-8901",
        "price_range": "$25 - $75 per plate",
        "base_price": 1200.00,
        "rating": 4.9,
        "description": "Multi-cuisine Michelin-inspired catering featuring live pasta counters, artisanal BBQ, traditional feasts, and signature dessert bars.",
        "image_url": "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80"
    },
    # Decoration
    {
        "name": "Aura Floral & Theme Designers",
        "category": "Decoration",
        "contact_name": "Elena Rostova",
        "email": "hello@auradecor.com",
        "phone": "+1 (555) 345-9012",
        "price_range": "$600 - $3,500",
        "base_price": 850.00,
        "rating": 4.9,
        "description": "Bespoke floral installations, royal mandap designs, neon photo booths, modern fairy lights, and themed table centerpieces.",
        "image_url": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80"
    },
    # Photography
    {
        "name": "Lumina Cinematic Photography",
        "category": "Photography",
        "contact_name": "David Sterling",
        "email": "studio@luminaphoto.com",
        "phone": "+1 (555) 456-0123",
        "price_range": "$500 - $2,200",
        "base_price": 700.00,
        "rating": 4.85,
        "description": "Award-winning portraiture and candid documentary event photography with full 4K delivery, cloud gallery, and physical heirloom albums.",
        "image_url": "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80"
    },
    # Videography
    {
        "name": "Apex Motion Cinematic Films",
        "category": "Videography",
        "contact_name": "Siddharth Rao",
        "email": "films@apexmotion.com",
        "phone": "+1 (555) 567-1234",
        "price_range": "$700 - $2,800",
        "base_price": 900.00,
        "rating": 4.92,
        "description": "Drone aerial filming, cinematic teaser trailers, full 4K multi-cam ceremony recordings, and same-day highlight reels.",
        "image_url": "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80"
    },
    # DJ/Music
    {
        "name": "DJ Nexus & Groove Collective",
        "category": "DJ/Music",
        "contact_name": "DJ Alex Knight",
        "email": "booking@djnexus.com",
        "phone": "+1 (555) 678-2345",
        "price_range": "$400 - $1,800",
        "base_price": 600.00,
        "rating": 4.88,
        "description": "Chart-topping DJ sets spanning Retro, EDM, Hip-Hop, Bollywood, and Deep House with wireless mics, cold sparklers, and club lighting.",
        "image_url": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80"
    },
    # Makeup
    {
        "name": "Glamour Touch Bridal & Party Studio",
        "category": "Makeup",
        "contact_name": "Sophia Bennett",
        "email": "sophia@glamourmakeover.com",
        "phone": "+1 (555) 789-3456",
        "price_range": "$150 - $800",
        "base_price": 300.00,
        "rating": 4.95,
        "description": "High-definition bridal and guest makeup, hair styling, airbrush makeup, and pre-event skincare treatments.",
        "image_url": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80"
    },
    # Invitation
    {
        "name": "Papier Royale & Digital Invite Studio",
        "category": "Invitation",
        "contact_name": "Chloe Dupont",
        "email": "orders@papierroyale.com",
        "phone": "+1 (555) 890-4567",
        "price_range": "$100 - $600",
        "base_price": 180.00,
        "rating": 4.78,
        "description": "Hand-embossed gold foil physical invites, animated WhatsApp video invitations, custom typography cards, and RSVP tracking.",
        "image_url": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80"
    },
    # Transportation
    {
        "name": "Prestige Chauffeur & Fleet Escort",
        "category": "Transportation",
        "contact_name": "Victor Rossi",
        "email": "dispatch@prestigefleet.com",
        "phone": "+1 (555) 901-5678",
        "price_range": "$300 - $1,500",
        "base_price": 450.00,
        "rating": 4.82,
        "description": "Vintage luxury vintage cars for couples, Mercedes S-Class executive sedans, and 24-seater luxury coaches for guest transfers.",
        "image_url": "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80"
    },
    # Security
    {
        "name": "ShieldPoint Event Bouncers & Security",
        "category": "Security",
        "contact_name": "Captain Ryan Hayes",
        "email": "ops@shieldpointsec.com",
        "phone": "+1 (555) 012-6789",
        "price_range": "$350 - $1,200",
        "base_price": 400.00,
        "rating": 4.89,
        "description": "Licensed VIP bodyguards, entry gate metal detectors, crowd management professionals, and emergency response teams.",
        "image_url": "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80"
    }
]

def seed_database():
    """Seeds initial categories, venues, vendors, admin user, and sample events"""
    try:
        # 1. Admin User
        admin = User.query.filter_by(email="admin@eventease.com").first()
        if not admin:
            admin = User(
                name="System Administrator",
                email="admin@eventease.com",
                phone="+1 (555) 000-0001",
                role="ADMIN",
                is_active=True
            )
            admin.set_password("Admin@123")
            db.session.add(admin)

        # 2. Demo User
        demo_user = User.query.filter_by(email="john@eventease.com").first()
        if not demo_user:
            demo_user = User(
                name="John Doe",
                email="john@eventease.com",
                phone="+1 (555) 123-4567",
                role="USER",
                is_active=True
            )
            demo_user.set_password("User@123")
            db.session.add(demo_user)
            db.session.flush()

        # 3. Categories
        for cat_data in EVENT_CATEGORIES_DATA:
            cat = EventCategory.query.filter_by(slug=cat_data["slug"]).first()
            if not cat:
                cat = EventCategory(**cat_data)
                db.session.add(cat)

        # 4. Venues
        for venue_data in SAMPLE_VENUES:
            v = Venue.query.filter_by(name=venue_data["name"]).first()
            if not v:
                v = Venue(**venue_data)
                db.session.add(v)

        # 5. Vendors
        for vendor_data in SAMPLE_VENDORS:
            vnd = Vendor.query.filter_by(name=vendor_data["name"]).first()
            if not vnd:
                vnd = Vendor(**vendor_data)
                db.session.add(vnd)

        db.session.commit()

        # 6. Sample Event for Demo User if none exists
        if demo_user and Event.query.filter_by(user_id=demo_user.id).count() == 0:
            wedding_cat = EventCategory.query.filter_by(name="Wedding").first()
            venue = Venue.query.first()
            
            sample_event = Event(
                user_id=demo_user.id,
                category_id=wedding_cat.id if wedding_cat else None,
                venue_id=venue.id if venue else None,
                name="Alexander & Olivia's Royal Wedding",
                event_type="Wedding",
                description="A grand royal wedding celebration featuring sunset vows at the Grand Crystal Ballroom followed by a 5-course banquet and musical gala.",
                date=date.today() + timedelta(days=45),
                start_time=time(16, 30),
                end_time=time(23, 30),
                location="The Grand Crystal Ballroom & Gardens, Downtown",
                number_of_guests=250,
                total_budget=15000.00,
                status="Planning"
            )
            db.session.add(sample_event)
            db.session.flush()

            # Sample Guests
            if Guest.query.filter_by(event_id=sample_event.id).count() == 0:
                guests = [
                    Guest(event_id=sample_event.id, name="Eleanor Vance", email="eleanor@example.com", phone="+1 555-111-222", relationship="Family", rsvp_status="Accepted", number_of_guests=2),
                    Guest(event_id=sample_event.id, name="Julian Croft", email="julian@example.com", phone="+1 555-222-333", relationship="Friend", rsvp_status="Accepted", number_of_guests=1),
                    Guest(event_id=sample_event.id, name="Sophia Sterling", email="sophia@example.com", phone="+1 555-333-444", relationship="VIP", rsvp_status="Pending", number_of_guests=2),
                    Guest(event_id=sample_event.id, name="Marcus Brody", email="marcus@example.com", phone="+1 555-444-555", relationship="Colleague", rsvp_status="Declined", number_of_guests=1)
                ]
                db.session.add_all(guests)

            # Sample Expenses
            if Expense.query.filter_by(event_id=sample_event.id).count() == 0:
                expenses = [
                    Expense(event_id=sample_event.id, category="Venue", item_name="Ballroom Deposit & Lawn Rental", estimated_cost=3200.00, actual_cost=3200.00, paid_status="Paid"),
                    Expense(event_id=sample_event.id, category="Food/Catering", item_name="Buffet Dinner & Cocktail Bar", estimated_cost=4500.00, actual_cost=4200.00, paid_status="Partial"),
                    Expense(event_id=sample_event.id, category="Decoration", item_name="Floral Arch & Centerpieces", estimated_cost=1500.00, actual_cost=1650.00, paid_status="Paid"),
                    Expense(event_id=sample_event.id, category="Photography", item_name="Cinematography & 4K Photo Package", estimated_cost=1800.00, actual_cost=1800.00, paid_status="Partial"),
                    Expense(event_id=sample_event.id, category="Music/DJ", item_name="Live Acoustic Band & DJ Setup", estimated_cost=900.00, actual_cost=850.00, paid_status="Unpaid"),
                    Expense(event_id=sample_event.id, category="Invitations", item_name="Foil Embossed Cards & RSVP Site", estimated_cost=250.00, actual_cost=220.00, paid_status="Paid")
                ]
                db.session.add_all(expenses)

            # Sample Checklists
            if Checklist.query.filter_by(event_id=sample_event.id).count() == 0:
                checklists = [
                    Checklist(event_id=sample_event.id, task_name="Finalize guest seating arrangement", due_date=date.today() + timedelta(days=20), is_completed=True, category="Logistics"),
                    Checklist(event_id=sample_event.id, task_name="Food menu tasting session with caterer", due_date=date.today() + timedelta(days=15), is_completed=True, category="Catering"),
                    Checklist(event_id=sample_event.id, task_name="Confirm acoustic sound check schedule", due_date=date.today() + timedelta(days=35), is_completed=False, category="Entertainment"),
                    Checklist(event_id=sample_event.id, task_name="Distribute physical & digital invitations", due_date=date.today() + timedelta(days=10), is_completed=True, category="Invitations")
                ]
                db.session.add_all(checklists)

            # Digital Invitation
            if Invitation.query.filter_by(event_id=sample_event.id).count() == 0:
                invitation = Invitation(
                    event_id=sample_event.id,
                    template_style="Royal Gold",
                    custom_message="We warmly invite you to share our special moments of love, joy, and new beginnings as we tie the knot!",
                    host_contact="+1 (555) 123-4567",
                    dress_code="Black Tie & Elegant Evening Attire",
                    rsvp_deadline=date.today() + timedelta(days=30),
                    views_count=18
                )
                db.session.add(invitation)

            db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f">>> [Seed Data Error] {e}")

if __name__ == '__main__':
    from app import create_app
    app = create_app()
    print(">>> [Seed Data] MySQL Database created and seeded successfully!")


