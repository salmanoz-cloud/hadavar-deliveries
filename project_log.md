# Project Log - הדוור הבא לעובדים (Next Mail Employees)

## Overview
This document tracks all development activities, conversations, and decisions related to the "הדוור הבא לעובדים" (Next Mail Employees) project.

---

## Session 1: Project Initialization
**Date:** October 18, 2025  
**Time:** 09:22 GMT+3

### Conversation Summary
User requested to create a new project named "הדוור הבא לעובדים" (Next Mail Employees). The project was initialized with full-stack capabilities including server, database, and user management features.

### Actions Performed
1. **Project Created:** `next_mail_employees`
   - Framework: React 19 + Express 4 + tRPC 11
   - Database: MySQL with Drizzle ORM
   - Authentication: Manus OAuth
   - UI Components: shadcn/ui + Tailwind CSS 4

2. **Development Server Started:**
   - URL: https://3000-i5362boepfmiexihu5d4q-d701e655.manusvm.computer
   - Status: Running
   - Port: 3000

3. **Version:** 3c54851b (Initial checkpoint)

---

## Session 2: GitHub Integration & Project Backup
**Date:** October 18, 2025  
**Time:** 09:34 GMT+3

### Conversation Summary
User requested to save all project files to the connected GitHub repository (salmanoz-cloud/hadavar-deliveries).

### Actions Performed
1. **Repository Cloned:** salmanoz-cloud/hadavar-deliveries
2. **Project Files Copied:** All files from next_mail_employees
3. **Git Configuration & Push:**
   - Commit Hash: f78e3475
   - Message: "Initial commit: Next Mail Employees project"
   - Data Size: 57.33 MiB

---

## Session 3: Project Log Documentation
**Date:** October 18, 2025  
**Time:** 09:35+ GMT+3

### Conversation Summary
User requested creation of project_log.md file to document all project activities.

### Actions Performed
1. **Created project_log.md** in repository root
2. **Commit Hash:** d0ef236e

---

## Session 4: Repository Cleanup
**Date:** October 18, 2025  
**Time:** 09:40+ GMT+3

### Conversation Summary
User noticed unnecessary files (node_modules, build artifacts) were pushed. User requested to keep only project source files.

### Actions Performed
1. **Removed Unnecessary Directories:** node_modules, .pnpm-store, dist, build, .next, out
2. **Created .gitignore File** with comprehensive exclusions
3. **Cleaned Git History:** Removed tracked files from git cache
4. **Commit Hash:** 430f4dd2

---

## Session 5: Application Plan Review & Analysis
**Date:** October 18, 2025  
**Time:** 10:45+ GMT+3

### Conversation Summary
User provided comprehensive application plan document for the "הדוור הבא" (Next Mail Employees) system. Plan details complete parcel delivery management system with three interconnected web applications, WhatsApp bot, and payment processing.

### System Overview

**Project Name:** הדוור הבא (Next Mail Employees)

**Purpose:** Complete parcel delivery management solution for delivering packages to employee families at companies.

**Core Components:**
1. Customer Application (אפליקציית לקוחות)
2. Courier Application (אפליקציית שליחים)
3. Admin Application (אפליקציית ניהול)
4. WhatsApp Bot with AI Integration
5. Payment Processing System

### Technology Stack

**Backend Infrastructure:**
- Firebase Firestore (NoSQL real-time database)
- Firebase Authentication (with family hierarchy support)
- Firebase Cloud Functions (server-side logic)
- Firebase Cloud Messaging (FCM) for push notifications
- Firebase Storage (file storage)
- Firebase Hosting (web app hosting)

**Payment Processing:**
- Meshulam (Meshulam) - Primary payment processor
- Support for: Google Pay, Apple Pay, Bit, Credit cards
- Standing order (Heuristic Keva) for monthly billing

**WhatsApp Integration:**
- WhatsApp Business API (via Twilio/WATI/360dialog)
- Webhook-based message processing
- Real-time message handling

**AI/LLM Services:**
- GPT-4 Mini (OpenAI) or Gemini Flash (Google)
- Purpose: Automated message analysis and data extraction
- Tasks: Extract tracking numbers, addresses, dates, pickup locations

**Frontend:**
- React for all three applications
- Full RTL (Right-to-Left) support for Hebrew
- Responsive design (Desktop + Mobile)
- Tailwind CSS for styling

### Database Collections (Firestore)

1. **users** - Customer accounts with family hierarchy
2. **companies** - Company information and details
3. **parcels** - Package information and status tracking
4. **couriers** - Courier profiles and assignments
5. **payments** - Payment transactions and history
6. **tickets** - Support tickets and customer service
7. **whatsapp_messages** - WhatsApp message logs
8. **admin_users** - Administrator accounts

### Application 1: Customer App (אפליקציית לקוחות)

**Purpose:** For primary users and family members to manage packages, track shipments, and manage subscription/payments.

**Key Features:**

**Registration & Authentication:**
- Primary user registration: Full name, phone, email, password, subscription plan selection
- Dual verification: Email confirmation + WhatsApp verification
- Secondary user (family member): Added by primary user with phone verification
- Family hierarchy support

**Dashboard:**
- Primary user: All family packages, active count, pending deliveries, subscription status, monthly quota
- Secondary user: Only their own packages
- Quick filters by status, owner, date
- Search by tracking number

**Package Management (3 Methods):**
1. WhatsApp Bot: Forward delivery notification to bot (automatic extraction)
2. Screenshot Upload: Upload or paste message for AI extraction
3. Manual Entry: Complete form with all required fields

**Package Tracking:**
- Timeline view: Pending → Picked up → In transit → Delivered
- Proof of delivery with photo/signature
- Detailed location and time information
- Quick search functionality

**Family Management:**
- Add/remove family members
- View each member's packages
- Manage permissions and quotas

**Payments & Subscription:**
- Subscription plans: 10/15/20 packages per month
- Payment methods: Credit card, Bit, Google Pay, Apple Pay
- Automatic billing on 7th of each month
- Payment history with receipts
- Plan upgrade/downgrade with pro-rata calculation

**Support System:**
- Open support tickets
- Track ticket status (open, in progress, resolved)
- Attach images/documents
- Receive support responses

**Push Notifications:**
- New package added
- Package picked up
- Package in transit
- Package delivered
- Payment reminders (3 days before)
- Payment confirmations
- Payment failures

**Design Elements:**
- Colors: Primary blue (#2563EB), Secondary green (#10B981), Warning orange (#F59E0B), Error red (#EF4444)
- Full RTL support for Hebrew
- High contrast for accessibility
- Large touch targets for mobile
- Responsive design

### Application 2: Courier App (אפליקציית שליחים)

**Purpose:** For couriers to manage pickups and deliveries, scan barcodes, and update statuses in real-time.

**Key Features:**

**Secure Login:**
- Username and password created by admin
- Credentials sent via WhatsApp/SMS
- No self-registration allowed

**Dashboard:**
- Daily summary: Total pickups, deliveries, completed count
- Two main tabs: Pickups and Deliveries

**Pickups Tab:**
- Grouped by pickup location
- Display: Location name, address, operating hours, package count
- Navigation buttons (Waze/Google Maps)
- Barcode scanning with manual entry option
- Automatic status update to "picked_up"
- Smart sorting: By proximity (GPS), deadline, quantity

**Deliveries Tab:**
- Grouped by company
- Display: Company name, address, floor, notes, package count
- Filters: By date, company, employee, status
- Barcode scanning for each delivery
- Proof of delivery: Photo + optional signature
- Recipient name entry
- Issue reporting: Customer unavailable, package not found, wrong address, refusal

**Reports:**
- Daily report: Pickups/deliveries completed, work time, distance traveled
- Weekly performance graphs

**Route Map:**
- Visual map of all pickup/delivery points
- Recommended route
- Estimated travel time
- Manual order adjustment

**Offline Support:**
- Local data storage
- Automatic sync when internet available

**Design:**
- Simple and fast interface
- Large buttons
- Clear colors
- Minimal typing required
- Full RTL support

### Application 3: Admin App (אפליקציית ניהול)

**Purpose:** Comprehensive management system for admins to manage companies, employees, couriers, packages, payments, and reports.

**Key Features:**

**Dashboard:**
- Key metrics: Active customers, active packages, pickups/deliveries today, current month revenue
- Graphs: Packages by status (pie), trend over time (line), revenue by month (bar), distribution by company
- Alerts: Failed payments, disputed packages, open support tickets

**Company Management:**
- List all companies with details
- Add new companies with full information
- Edit company details
- View associated employees
- Manage service days

**Employee Management:**
- List employees with subscription details
- View family members
- View complete package history
- Manual plan upgrade/downgrade
- Account suspension/activation
- Password reset
- Send messages to employees

**Courier Management:**
- List couriers with performance metrics
- Add new couriers (auto-generate credentials)
- Edit courier details
- Manage service areas
- Interactive map for area assignment
- Suspend/activate couriers

**Package Management:**
- Detailed table with all package information
- Advanced filters and search
- View full package details and timeline
- Manual status updates
- Reassign to different courier
- Mark as "disputed"
- Smart assignment: Select multiple → Choose courier → Auto-remove from previous

**Payment Management:**
- Payment history table
- Filter by status, date, payment method
- Failed payments list with retry option
- Send payment reminders
- Account suspension for unpaid
- Manual payment creation
- Refunds and credits

**Reports:**
- Pre-built reports: By company, courier performance, revenue, by region
- Custom report builder: Select fields, filters, grouping, sorting, export
- Export to Excel/PDF

**Broadcast Notifications:**
- Send to: All customers, specific company, all couriers, specific courier
- Types: Push notification, SMS, WhatsApp, Email
- Content: Title, message, optional link

**System Settings:**
- General: System name, logo, colors, language
- Payments: Meshulam API keys, plan prices, billing date
- WhatsApp: API key, bot number, auto-messages
- Notifications: FCM key, message templates

### WhatsApp Bot + AI Integration

**Purpose:** Automated message analysis and package data extraction from delivery notifications.

**Workflow:**
1. Customer receives SMS from delivery provider
2. Customer forwards message to WhatsApp bot
3. Webhook receives message
4. System identifies user by phone number
5. AI analyzes message and extracts:
   - Customer name
   - Tracking number
   - Pickup location name
   - Address
   - Operating hours
   - Last pickup date
   - Tracking link
6. Confidence check: >0.8 = auto-create, <0.8 = ask user confirmation
7. Package created in Firestore
8. WhatsApp confirmation sent to user
9. Push notification to app

**Error Handling:**
- Unclear message: Suggest manual upload or entry
- Unregistered user: Prompt to register
- Package quota exceeded: Suggest plan upgrade

### Core Workflows

1. **Customer adds package via WhatsApp:**
   - Message → Bot → AI analysis → Auto-create or confirm → Notification

2. **Admin assigns package to courier:**
   - Select packages → Choose courier → Auto-remove from previous → Notify courier

3. **Courier picks up packages:**
   - Scan barcode → Confirm pickup → Update status → Notify customer

4. **Courier delivers packages:**
   - Arrive at company → Update all to "in transit" → Scan each → Photo proof → Update to "delivered" → Notify customer

5. **Monthly billing:**
   - 7th of month → Cloud Function → Charge all active customers → Update status → Send receipts

6. **Customer opens support ticket:**
   - Create ticket → Admin notified → Assign → Respond → Customer notified → Mark resolved

### Security & Privacy

- Firebase Security Rules for Firestore access control
- Password encryption via Firebase Authentication
- Data encryption in transit (HTTPS) and at rest
- Payment details: Only token stored (not actual card data)
- GDPR compliance: Account deletion, data export
- 7-year retention for accounting purposes

### Testing Strategy

- Unit tests: Helper functions, validations, calculations
- Integration tests: Cloud Functions, Meshulam integration, WhatsApp integration, AI parsing
- E2E tests: Full user scenarios (registration → package upload → pickup → delivery)
- Manual testing: UI/UX, RTL, responsiveness, accessibility

### Deployment Plan

1. Firebase project setup (2-3 days)
2. Customer app development (7-10 days)
3. Courier app development (5-7 days)
4. Admin app development (7-10 days)
5. WhatsApp bot + AI (5-7 days)
6. Payment integration (3-5 days)
7. Testing & fixes (5-7 days)
8. Deployment & launch (2-3 days)

**Total Estimated Timeline: 36-57 days (~5-7 weeks)**

### Estimated Monthly Costs

- Firebase: ~$35-90/month
- Meshulam fees: ~210-250 NIS/month (~0.9-1% + 1 NIS per transaction)
- WhatsApp API: ~$7.5-15/month
- AI/LLM: ~$7-10/month

**Total: ~$60-120/month (~220-450 NIS)**

### Key Strengths of the Plan

✅ Modern technology: Firebase provides reliable, scalable infrastructure
✅ Full automation: WhatsApp bot + AI reduces manual work
✅ Excellent UX: Intuitive interfaces with full Hebrew support
✅ Flexible payments: Meshulam with all popular payment methods
✅ Comprehensive management: Admin app with all necessary tools
✅ Scalability: Can grow from 300 to 3000+ customers without major changes

---

## Current Status
- Application plan received and fully analyzed
- System architecture understood
- Technology stack identified
- All three applications requirements documented
- WhatsApp bot and AI integration requirements clear
- Payment processing requirements defined
- Database structure planned
- Deployment timeline estimated

## Ready for Next Phase
Awaiting user instructions on implementation approach and priorities.


