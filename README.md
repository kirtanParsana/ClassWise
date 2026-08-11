# ClassWise 📅

> An AI-assisted Academic Timetable Generator and Resource Allocation System

ClassWise streamlines the complex task of academic scheduling by combining intelligent automation with an intuitive interface — helping institutions generate conflict-free timetables, allocate resources efficiently, and manage faculty and course data all in one place.

The system supports multiple academic stakeholders including **Coordinators, HODs, Faculty, and Students**, with role-based access, timetable review workflows, approval management, publishing, and timetable version control.

---

## ✨ Features

- **Role-Based Access Control** — Secure role-based access for Coordinators, HODs, Faculty, and Students with dedicated dashboards and permissions.

- **Data Management** — Input and manage courses, faculty, rooms, divisions, sections, and scheduling data from a centralized dashboard.

- **Automated Timetable Generation** — Generate feasible timetables using rule-based and constraint-based scheduling logic while considering faculty, room, class, and timeslot constraints.

- **Resource Allocation** — Efficiently assign classrooms and laboratories based on availability, capacity, and scheduling requirements.

- **Conflict Detection** — Automatically detect faculty, classroom, division, class, and timeslot conflicts before a timetable is published.

- **AI-Assisted Suggestions** — Provide intelligent scheduling suggestions and possible alternatives when conflicts or scheduling issues are detected.

- **Timetable Workflow** — Manage the complete timetable lifecycle from draft creation and generation to review, approval, and publishing.

- **Timetable Review & Approval** — Coordinators can submit timetables for HOD review, while HODs can approve, reject, and provide review feedback.

- **Timetable Version Management** — Maintain different timetable versions and track changes across scheduling iterations.

- **Published Timetable Management** — Publish approved timetables and make them available to authorized faculty and students.

- **Faculty Timetable** — Faculty members can view their assigned schedules and timetable information.

- **Student Timetable** — Students can view their published academic timetable and schedule.

- **Secure API Routes** — Protected API endpoints use authentication and role-based authorization before performing sensitive operations.

- **Firestore Security** — Database access is protected using Firebase Authentication and Firestore Security Rules.

---

## 🛠 Tech Stack

| Layer              | Technology                                      |
| ------------------ | ----------------------------------------------- |
| Framework          | Next.js (App Router)                            |
| Frontend           | React                                           |
| Backend / API      | Next.js Route Handlers                          |
| Database           | Firebase Firestore                              |
| Authentication     | Firebase Authentication                         |
| Server Auth        | Firebase Admin SDK                              |
| UI Components      | shadcn/ui                                       |
| Styling            | Tailwind CSS                                    |
| Language           | TypeScript                                      |
| Scheduling         | Rule-Based / Constraint-Based Scheduling        |
| AI Assistance      | AI-assisted Scheduling & Suggestions            |
| State Management   | React Context                                   |
| Security           | RBAC + Firestore Security Rules                |

---

## 📁 Project Structure

```text
classwise/
├── scripts/
│   ├── migrate-schedules.ts
│   └── verify-api-security.ts
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── conflicts/
│   │   │   ├── generate-timetable/
│   │   │   └── timetables/
│   │   │       └── [id]/
│   │   │           ├── actions/
│   │   │           └── suggestions/
│   │   │
│   │   ├── coordinator/
│   │   │   ├── profile/
│   │   │   └── timetable/
│   │   │       ├── drafts/
│   │   │       ├── published/
│   │   │       └── versions/
│   │   │
│   │   ├── dashboard/
│   │   │   └── timetable/
│   │   │
│   │   ├── faculty/
│   │   │   ├── profile/
│   │   │   └── timetable/
│   │   │
│   │   ├── hod/
│   │   │   ├── approved/
│   │   │   ├── profile/
│   │   │   ├── published/
│   │   │   ├── review/
│   │   │   └── suggestions/
│   │   │
│   │   ├── login/
│   │   ├── student/
│   │   │   ├── profile/
│   │   │   └── timetable/
│   │   │
│   │   └── unauthorized/
│   │
│   ├── components/
│   │   ├── auth/
│   │   ├── layout/
│   │   ├── timetable/
│   │   └── ui/
│   │
│   ├── context/
│   │   ├── auth-context.tsx
│   │   └── timetable-context.tsx
│   │
│   ├── firebase/
│   │   ├── admin.ts
│   │   └── provider.tsx
│   │
│   ├── hooks/
│   │   ├── use-published-schedules.ts
│   │   └── use-timetable-workflow.ts
│   │
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── authenticated-fetch.ts
│   │   ├── conflict-detection.ts
│   │   ├── firestore-utils.ts
│   │   ├── navigation.ts
│   │   ├── rbac.ts
│   │   ├── server-auth.ts
│   │   ├── server-timetable.ts
│   │   └── timetable-utils.ts
│   │
│   ├── services/
│   │   ├── conflictService.ts
│   │   ├── notificationService.ts
│   │   ├── scheduleService.ts
│   │   ├── suggestionService.ts
│   │   ├── timetableService.ts
│   │   └── userService.ts
│   │
│   └── types/
│       ├── auth.ts
│       └── timetable.ts
│
├── firestore.indexes.json
├── firestore.rules
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── .env
```

> `.env` contains environment variables and must not be committed to GitHub.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A Firebase project with Firestore enabled
- Firebase Authentication enabled
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/kirtanParsana/classWise.git
   cd classWise
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory and add your Firebase and AI credentials:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   GOOGLE_GENAI_API_KEY=your_google_ai_key

   FIREBASE_CLIENT_EMAIL=your_service_account_email
   FIREBASE_PRIVATE_KEY="your_private_key"
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open the app**

   Navigate to [http://localhost:9002](http://localhost:9002) in your browser.

---

## 📜 Available Scripts

| Command         | Description                                      |
| --------------- | ------------------------------------------------ |
| `npm run dev`   | Start the development server on port 9002        |
| `npm run build` | Build the project for production                 |
| `npm run start` | Start the production server                      |
| `npm run lint`  | Run ESLint                                       |
| `npx tsx scripts/migrate-schedules.ts` | Migrate legacy schedule data |
| `npx tsx scripts/verify-api-security.ts` | Verify API security patterns |

---

## 🔐 Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Firestore Database**.
3. Enable **Authentication**.
4. Enable **Email/Password** authentication.
5. Copy your Firebase configuration credentials into `.env`.
6. Configure Firebase Admin credentials for server-side operations.
7. Deploy Firestore rules using:

   ```bash
   firebase deploy --only firestore:rules
   ```

8. Deploy Firestore indexes using:

   ```bash
   firebase deploy --only firestore:indexes
   ```

---

## 🔄 Timetable Workflow

ClassWise manages the timetable through a structured workflow:

**Draft → Generated → Under Review → Approved → Published**

### Coordinator

- Create timetable drafts
- Generate timetables
- Detect conflicts
- Review scheduling suggestions
- Modify timetable data
- Submit timetables for HOD review
- View timetable versions
- View published timetables

### HOD

- Review submitted timetables
- Review conflicts
- Provide feedback
- Approve timetables
- Reject timetables
- View approved timetables
- View published timetables
- Review scheduling suggestions

### Faculty

- View assigned timetable
- View personal schedule
- Access faculty profile

### Student

- View published timetable
- View academic schedule
- Access student profile

---

## 🔒 Security

ClassWise uses multiple layers of authentication and authorization.

### Authentication

Firebase Authentication manages user identity and login.

### Role-Based Authorization

Supported roles:

- **Coordinator**
- **HOD**
- **Faculty**
- **Student**

### Protected Routes

Role-specific routes and dashboards are protected using authentication and authorization checks.

### API Authorization

Sensitive API endpoints verify authentication and role permissions before processing operations.

### Firestore Security Rules

Firestore Security Rules provide database-level access control in addition to application-level authorization.

---

## ⚡ Conflict Detection

ClassWise automatically detects scheduling conflicts involving:

- Faculty
- Rooms
- Divisions
- Classes
- Timeslots

Examples include:

- **Faculty Conflict** — A faculty member is assigned to multiple classes during the same timeslot.
- **Room Conflict** — Multiple classes are assigned to the same room at the same time.
- **Class Conflict** — A division or class is assigned to multiple subjects during the same timeslot.
- **Availability Conflict** — A faculty member or room is assigned outside its available schedule.

---

## 💡 AI-Assisted Scheduling

The current timetable generation system primarily uses **rule-based and constraint-based scheduling logic** to create feasible timetables.

AI-assisted functionality supports:

- Conflict resolution suggestions
- Alternative scheduling suggestions
- Timetable analysis
- Scheduling decision support

Future versions can integrate advanced optimization and machine-learning techniques to improve scheduling quality and personalization.

---

## 📊 Timetable Version Management

ClassWise supports timetable version management to maintain different iterations of generated and reviewed timetables.

This allows authorized users to:

- View previous timetable versions
- Track timetable changes
- Maintain scheduling history
- Review different iterations
- Preserve previous timetable states

---

## 🧪 API Security Verification

ClassWise includes a utility for verifying authorization patterns in protected API routes.

Run:

```bash
npx tsx scripts/verify-api-security.ts
```

The utility checks route source files and verifies that expected authentication and authorization mechanisms are present.

---

## 🔄 Schedule Migration

ClassWise includes a migration utility for migrating legacy nested schedule data into individual schedule documents.

Run:

```bash
npx tsx scripts/migrate-schedules.ts
```

The migration utility is designed to preserve legacy timetable data rather than immediately deleting it.

---

## 🤖 AI / ML Roadmap

The current scheduling engine uses rule-based and constraint-based logic.

The planned AI/ML pipeline is:

**Data Ingestion → Data Validation → Feature Engineering → ML Preference/Scoring Model → Constraint Optimization → Conflict Detection → AI-Assisted Suggestions → Timetable Quality Scoring → Final Timetable**

Future improvements include:

- Google OR-Tools for constraint optimization
- ML-based faculty preference scoring
- Historical timetable analysis
- Faculty preference prediction
- Timetable quality prediction
- AI-powered conflict resolution
- Resource utilization optimization

---

## 📌 Current Status

### Completed

- [x] Firebase Authentication
- [x] Role-Based Access Control
- [x] Protected Routes
- [x] Coordinator Dashboard
- [x] HOD Dashboard
- [x] Faculty Dashboard
- [x] Student Dashboard
- [x] Timetable Generation
- [x] Conflict Detection
- [x] Timetable Drafts
- [x] Timetable Review Workflow
- [x] HOD Approval / Rejection
- [x] Review Feedback
- [x] Timetable Publishing
- [x] Timetable Version Management
- [x] Scheduling Suggestions
- [x] Firestore Security Rules
- [x] Protected API Routes
- [x] Server-Side Authentication
- [x] Schedule Migration Utility
- [x] API Security Verification

### Planned

- [ ] Google OR-Tools optimization
- [ ] ML-based scheduling preference scoring
- [ ] Advanced AI scheduling recommendations
- [ ] Timetable quality scoring
- [ ] Faculty workload analytics
- [ ] Classroom utilization analytics
- [ ] PDF timetable export
- [ ] Excel timetable export
- [ ] Advanced analytics and reporting
- [ ] Automated testing
- [ ] Production deployment
- [ ] Improved notification system

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "feat: add your feature"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 👥 Team

Built as a major project by students of **Parul Institute of Technology, Parul University, Vadodara**.

---

## 📄 License

This project is for academic purposes. All rights reserved © ClassWise Team.
