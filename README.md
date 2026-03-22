# InternFlow

A comprehensive internship management platform built with Next.js 15, featuring AI-powered chat assistance, real-time job feeds, resume building, and job tracking capabilities.

## Features

- 🔍 **Real-time Internship Feed** - Search and browse internships from Remotive API
- 🤖 **AI Chat Assistant** - Get help with career advice, resume reviews, and interview prep
- 📄 **Resume Builder** - Create and customize professional resumes
- 📋 **Job Tracker** - Save favorite jobs and track application status
- 📊 **Skill Gap Analysis** - Identify areas for improvement based on job requirements
- 🎯 **Interview Questions** - Practice with role-specific interview questions
- 📈 **Progress Tracking** - Monitor your skill development over time
- 🔐 **Authentication** - Secure user authentication with NextAuth.js

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Authentication**: NextAuth.js
- **AI**: OpenAI API integration
- **Styling**: Tailwind CSS with dark mode support
- **Data**: Remotive API for internships, file-based persistence

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/priyaev186-netizen/internflow.git
cd internflow
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```env
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=your-openai-key-here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Routes

- `GET /api/internships` - Fetch internship listings
- `POST /api/chat` - AI chat functionality
- `GET/POST/PUT/DELETE /api/job-tracker` - Job tracking operations
- `GET/POST /api/auth/[...nextauth]` - Authentication

## Project Structure

```
internflow/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   ├── chat/
│   │   ├── internships/
│   │   └── job-tracker/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── public/
├── package.json
├── tsconfig.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Deployment

The app can be deployed to Vercel, Netlify, or any platform supporting Next.js:

```bash
npm run build
npm start
```

For production deployment, ensure all environment variables are properly configured.
