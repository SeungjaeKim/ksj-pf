# EduFlow Pro Design

Date: 2026-03-16
Status: Approved for planning
Working title: EduFlow Pro

## 1. Product Summary

EduFlow Pro is a portfolio-ready integrated SaaS mockup for admissions-driven academies that combine class operations with college entrance consulting. The product should feel like one real system, not a bundle of unrelated screens. It starts from inquiry and consultation CRM, then flows through enrollment, scheduling, attendance, payment management, academic reporting, parent communication, and executive monitoring.

The first release is explicitly a screen-first mockup product for portfolio presentation. There is no real database, payment gateway, or production messaging integration. Instead, the experience should behave like a semi-real product through shared demo data, believable state changes, connected navigation, and high-density operational UI.

## 2. Goals

### Primary goals

- Present one cohesive academy SaaS product across landing, admin web, parent portal, and mobile owner mode.
- Lead with consultation CRM as the main differentiator while still showing complete academy operations.
- Demonstrate a full lifecycle story: inquiry -> consultation -> trial -> enrollment -> attendance/payment/reporting -> parent trust -> director insight.
- Make the mockup feel like a near-product through consistent sample data and meaningful interface transitions.
- Position the service as a more strategic, higher-tier product than a basic attendance-and-messaging academy tool.

### Non-goals for the first release

- No real backend, persistent database, or production authentication.
- No full CRUD coverage for every possible academy entity.
- No actual payment processing, Kakao notification delivery, or SMS gateway integration.
- No native mobile app build.
- No deep ERP-level accounting workflows beyond believable fee, invoice, and delinquency mockups.

## 3. Product Positioning

### Core message

"From inquiry to enrollment to progress reports, keep the entire admissions academy workflow connected in one platform."

### Market position

The product should feel like the next step above a generic academy management system. The public message is not "we also manage students" but "we connect conversion, operations, and parent trust with measurable outcomes."

### Differentiation pillars

- Consultation CRM that clearly manages inquiry-to-enrollment conversion.
- Operational intelligence for owners, not just raw attendance and student lists.
- Parent-facing trust layer through reports, comments, reservations, and payment visibility.
- Multi-branch and executive views that imply scale.
- AI assistant and rule automation shown as premium features, even if implemented as mock experiences.

## 4. Target Academy And Users

### Target academy type

EduFlow Pro is designed around an admissions consulting hybrid academy:

- Middle and high school students
- Test prep plus academic consulting
- Multiple subjects and consulting touchpoints
- Strong emphasis on conversion, retention, and parent communication

### Core users

#### Owner / director

- Wants operational visibility, conversion metrics, payment health, and warning signals
- Uses dashboard, analytics, payments, and mobile owner mode heavily

#### Counseling manager

- Owns inquiry registration, consultation scheduling, trial lessons, and conversion follow-up
- Lives inside CRM board and lead detail flows

#### Teacher

- Needs timetable, attendance, homework, comments, and report tools
- Contributes to the parent trust layer through timely academic updates

#### Accounting staff

- Monitors invoices, discounts, overdue payments, refunds, and reminders
- Uses payment management and branch-level summaries

#### Parent

- Checks attendance, reports, payment status, consultation booking, and notices
- Experiences the service as a trust-building portal

#### Student

- Sees timetable, homework, attendance, and learning reports
- Uses a lighter version of the same portal experience

## 5. Experience Principles

- One academy story: the same leads, students, parents, classes, and payments must appear across surfaces.
- CRM first: the first story users understand should be how inquiries become enrolled students.
- Operational density: dashboards and management screens should feel data-rich and realistic, not empty wireframes.
- Parent trust matters: reporting and communication must feel polished and premium.
- Fast executive scanning: owner mobile screens should prioritize critical numbers and actions over full management depth.
- Portfolio clarity: even with many screens, the user should understand the product in a few minutes.

## 6. Product Structure

EduFlow Pro should be presented as one integrated product with four connected layers.

### 6.1 Public marketing layer

- Landing page
- Pricing section
- FAQ section
- Demo CTA and login entry

### 6.2 Admin web layer

- Shared shell for owner, counseling manager, teacher, and accounting staff
- Default first screen is the CRM board
- Persistent navigation to all major modules

### 6.3 Parent / student portal layer

- Separate but brand-consistent surface
- Focused on visibility, trust, and convenience

### 6.4 Mobile owner mode

- Compact executive interface
- Shows only the most important daily operational signals

## 7. Demo Data World

All mockups should use one shared fictional academy brand.

### Academy identity

- Academy name: Apex Admissions Lab
- Korean display name: 에이펙스 입시전략 학원
- Positioning: premium admissions consulting academy for middle and high school students

### Branches

- Gangnam Main
- Daechi Campus
- Mokdong Campus

### Subjects

- Math
- English
- Korean
- Social Studies / Science electives
- Admissions consulting

### Staff personas

- Director: Han Seo-jin
- Vice Director: Park Min-ho
- Counseling Manager: Lee Ji-eun
- Accounting Manager: Choi Hye-rin
- Teachers: Kim Do-yoon, Yoon Ara, Jeong Seung-min, Seo Hye-jin

### Representative student groups

- Grade 10 foundation student focused on school record improvement
- Grade 11 conversion candidate with rising counseling interest
- Grade 12 final sprint student with tight attendance and report needs
- Re-enrollment risk student with low attendance
- High-potential transfer lead from another academy

### Representative lead channels

- Instagram ad
- Blog content
- Parent referral
- Local moms cafe
- Offline briefing session

### Anchor story for the main flow

One featured lead should drive the entire demo:

- Student candidate: Choi Min-seo, Grade 11
- Goal: top-tier social sciences track
- Entry channel: Instagram inquiry
- Flow: inquiry registered -> consultation booked -> trial class completed -> enrollment converted -> class assigned -> attendance recorded -> first invoice issued -> report published -> parent views progress -> director sees updated metrics

## 8. Information Architecture

### 8.1 Landing page sections

- Hero with inquiry-to-enrollment message
- Problem and value framing
- CRM-first workflow section
- Operations dashboard preview
- Parent trust and report section
- Mobile owner mode section
- Pricing
- FAQ
- Final CTA

### 8.2 Auth and entry screens

- Login
- Sign up or start demo
- Role selection or branch selection
- Lightweight first-run orientation card

### 8.3 Admin web navigation

- Home
- Consultation CRM
- Students / Parents
- Classes / Timetable
- Attendance
- Payments
- Learning Reports
- Messages
- Analytics
- Branches
- Settings

### 8.4 Parent / student portal navigation

- Home
- Attendance
- Timetable
- Homework
- Learning Reports
- Scores / Trends
- Payments
- Consultation Booking
- Notices / Messages

### 8.5 Mobile owner mode navigation

- Today
- Leads
- Attendance Risk
- Payments
- Alerts

## 9. Screen Inventory

The mockup should cover roughly 27 to 33 connected screens. Depth matters more than raw count, but the product must feel broad.

### 9.1 Public and entry screens

- Landing page
- Login
- Sign up / demo entry
- Role or branch selector

### 9.2 Admin web screens

- Owner home dashboard
- CRM board
- Lead detail
- Trial lesson scheduler
- Enrollment conversion wizard
- Student and parent list
- Student 360 detail
- Class management
- Timetable view
- Attendance management
- Payment management
- Learning report editor
- Message center
- Analytics dashboard
- Branch comparison dashboard
- Settings / permissions

### 9.3 Parent / student portal screens

- Portal home
- Attendance history
- Personal timetable
- Homework tracker
- Learning report detail
- Score trend view
- Payment history
- Consultation booking
- Notices / inbox

### 9.4 Mobile owner mode screens

- Today home
- New leads
- Attendance risk
- Payment reminders
- Alert feed

## 10. Core Demo Flows

### Flow 1: Inquiry to consultation

Landing CTA or demo entry should lead into CRM perception. In the admin mockup, a new lead appears in the "Inquiry Received" stage with source, target school, parent contact, and assigned counselor.

### Flow 2: Consultation to trial to enrollment

The counseling manager opens a lead, reviews notes, books a trial lesson, then converts the lead into an enrolled student. This action should visibly change stage badges, create a student profile, and add class/payment placeholders.

### Flow 3: Enrollment to operations

After conversion, the student appears in class assignments, timetable, attendance lists, and invoice status. Student 360 should become the central record tying these together.

### Flow 4: Teacher report to parent trust

A teacher writes or updates a learning report with attendance, homework completion, score notes, and coaching comments. The parent portal should show the corresponding report as if it were published from the admin side.

### Flow 5: Executive monitoring

The owner dashboard and mobile owner mode should reflect updated counts for leads, conversions, absences, overdue payments, and at-risk students after the main scenario changes state.

## 11. Admin Web Design

### Primary shell

- Left navigation for modules
- Top bar for branch switcher, global search, notifications, and profile
- Main content area with KPI cards and high-density tables or boards
- Optional right-side contextual panel for quick actions

### CRM board

The CRM board is the flagship screen. It uses a pipeline layout with these stages:

- Inquiry Received
- Consultation Scheduled
- Trial Booked
- Trial Completed
- Enrolled
- Lost / Deferred

Each card should show:

- Student candidate name
- Grade
- Target track
- Source channel
- Parent contact
- Assigned counselor
- Next action date

### Lead detail

This screen should combine:

- Candidate profile
- Parent profile
- Inquiry source
- Consultation notes
- Trial history
- Internal comments
- Stage controls
- Fast actions for message, schedule, convert

### Owner dashboard

This screen should prioritize:

- New inquiries today
- Today's consultations
- Conversion rate this month
- Overdue payments
- Absence alerts
- Re-enrollment risk count

Supporting modules should include:

- Pipeline summary chart
- Branch revenue snapshot
- Risk student list
- Parent inquiry feed
- To-do and anomaly cards

### Student 360

This is the key connected record view. It should contain:

- Profile and goal school
- Parent contacts
- Current classes
- Attendance trend
- Payment status
- Recent reports
- Test scores
- Counseling notes
- Suggested next counseling topics

### Payments

The payment module should show:

- Invoice schedule
- Paid / unpaid status
- Discount types
- Refund history
- Bulk reminders
- Predicted monthly revenue summary

### Learning reports

The report editor should show:

- Subject and teacher selector
- Homework completion
- Lesson progress
- Score notes
- Strengths and weaknesses
- Parent-facing comment
- AI draft button

## 12. Parent / Student Portal Design

The portal should feel warmer, clearer, and less operational than the admin web while still staying on-brand.

### Portal home

Top cards should include:

- Today's class
- Recent attendance
- Homework due this week
- Latest teacher comment
- Payment status
- Consultation booking CTA

### Learning report detail

This should be one of the most polished screens in the whole project. It should include:

- Weekly or monthly summary
- Attendance note
- Homework performance
- Lesson progress
- Score graph
- Teacher comment
- Suggested focus for next week

### Consultation booking

This screen should allow:

- Selecting counseling type
- Picking a time slot
- Leaving a request note
- Confirming reservation

This interaction should feel connected back to the CRM system conceptually.

## 13. Mobile Owner Mode Design

Mobile owner mode is not a shrunk admin web. It is an executive command summary.

### Today screen

Large cards should show:

- New inquiries today
- Consultations today
- No-show or absence alerts
- Overdue payments
- Critical alerts

### Leads screen

- Highest-priority new leads
- Registration likelihood tags
- Quick call or message actions
- Today's follow-up queue

### Attendance risk screen

- Consecutive absence students
- Re-enrollment risk markers
- Score drop and attendance decline warnings

### Payment reminders screen

- Today overdue
- Reminder-ready accounts
- Upcoming renewals

### Alert feed

Short operational summaries such as:

- Trial completed, follow-up needed
- Gangnam branch conversion rate down
- Grade 12 premium class has 3 overdue invoices

## 14. Visual Direction

### Tone

- Premium but approachable
- Operationally sharp
- Trustworthy for parents
- Strategic and organized for directors

### Visual mood

- Deep navy and ink blue base
- Sage, mist gray, and soft ivory support tones
- Orange or mint as signal accent for urgent cards and action cues
- Dense but breathable spacing, avoiding sterile ERP aesthetics

### Typography direction

- Strong display type for landing hero and major metrics
- Clear Korean-friendly sans for application UI
- Distinct hierarchy between strategic metrics and routine admin labels

### UI patterns

- KPI cards with delta indicators
- Split layouts for board plus detail
- Timeline and notes panels
- Status chips and urgency tags
- Rich tables with filters
- Parent-facing report cards with charts and summaries

## 15. Interaction Model

The product must feel semi-live even without a backend.

### Required interaction rules

- Navigation should feel route-based, not like a long static poster.
- Shared demo state should be reused across screens.
- High-value actions should visibly change UI state.
- Filters, tabs, side panels, and board movements should feel responsive.
- Parent portal and mobile mode should reflect the consequences of admin-side actions where reasonable.

### Key fake-but-believable mutations

- Move a lead between CRM stages
- Convert a lead into a student
- Mark attendance states
- Publish or update a report
- Trigger payment reminder status
- Change alert counts on dashboards

## 16. Scope Prioritization

### Priority A: fully interactive core screens

- Landing page
- Login / demo entry
- CRM board
- Lead detail
- Enrollment conversion
- Owner dashboard
- Student 360
- Payment management
- Learning report editor
- Portal home
- Learning report detail
- Mobile Today screen

### Priority B: strong secondary screens

- Timetable
- Attendance
- Message center
- Analytics
- Consultation booking
- Payment history
- Notices / inbox
- Branch comparison
- Settings

### Priority C: support and polish screens

- Sign up
- FAQ
- Pricing details
- Permission settings
- Refund detail
- Message template detail
- AI feature explainer panels

## 17. Delivery Shape In This Repository

This project should fit the existing static portfolio structure and should not depend on unavailable backend systems.

### Recommended shape

- Add a dedicated project under `projects/eduflow-pro/`
- Keep a public landing entry point
- Provide separate surface entry points for admin, portal, and mobile mode
- Use shared JavaScript data modules so state and copy stay consistent

### Mockup implementation strategy

- Static HTML, CSS, and vanilla JavaScript
- Shared sample data store in local JS objects or JSON
- Route-like navigation through page-level files or stateful views
- Charts, tables, boards, and metrics generated from the same sample dataset

## 18. Success Criteria

The design is successful if:

- Reviewers immediately understand this as a real academy SaaS concept rather than a disconnected UI exercise.
- The CRM-first story is obvious within the first minute.
- Parent trust and academic reporting feel like genuine product strengths.
- The same student and lead records connect naturally across screens.
- The owner dashboard and mobile mode feel useful for decision-making.
- The mockup looks portfolio-ready without requiring backend infrastructure.

## 19. Future Expansion After Mockup Phase

- AI assistant for counseling summaries and parent comments
- Rule-based automation for absences, renewals, and overdue reminders
- Kakao notification mock integration
- PDF monthly report export
- Expanded branch benchmarking
- Role-specific home dashboards
