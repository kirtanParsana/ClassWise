# ClassWise 📅

> An AI-assisted Academic Timetable Generator and Resource Allocation System

ClassWise streamlines the complex task of academic scheduling by combining intelligent automation with an intuitive interface — helping institutions generate conflict-free timetables, allocate resources efficiently, and manage faculty and course data all in one place.

---

## ✨ Features

- **Data Management** — Input and manage courses, faculty, and rooms from a centralized dashboard.
- **Automated Timetable Generation** — Generate conflict-free timetables with a single action using AI-driven scheduling logic.
- **Resource Allocation** — Efficiently assign classrooms and labs based on availability and capacity.
- **Conflict Resolution** — Automatically detect scheduling conflicts and receive AI-powered suggestions to resolve them.
- **Timetable Display** — View and export timetables tailored for different stakeholders — students, faculty, and administrators.

---

## 🛠 Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Backend / Database | [Firebase](https://firebase.google.com/) (Firestore, Auth) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Language | TypeScript |
| AI Integration | Google Generative AI (via `src/ai`) |

---

## 📁 Project Structure

```
classwise/
├── src/
│   ├── ai/              # AI integration & timetable generation logic
│   ├── app/             # Next.js App Router pages & layouts
│   ├── components/      # Reusable UI components
│   ├── context/         # React context providers
│   ├── firebase/        # Firebase config & service functions
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utility functions & helpers
├── .env                 # Environment variables (not committed)
├── next.config.ts       # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS configuration
├── firestore.rules      # Firestore security rules
└── apphosting.yaml      # Firebase App Hosting config
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A Firebase project with Firestore enabled

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/classwise.git
   cd classwise
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
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   GOOGLE_GENAI_API_KEY=your_google_ai_key
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open the app**

   Navigate to [http://localhost:9002](http://localhost:9002) in your browser.

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server on port 9002 |
| `npm run build` | Build the project for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint for code quality checks |

---

## 🔐 Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Firestore Database** and **Authentication** (Email/Password).
3. Copy your Firebase config credentials into `.env`.
4. Deploy Firestore rules using:
   ```bash
   firebase deploy --only firestore:rules
   ```

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

Built as a minor project by students of **Parul Institute of Technology, Parul University, Vadodara**.

---

## 📄 License

This project is for academic purposes. All rights reserved © ClassWise Team.
# ClassWise
