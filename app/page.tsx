"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

type Message = {
  from: 'user' | 'bot';
  text: string;
  timestamp: string;
};

type UserProfile = {
  name: string;
  email: string;
  university: string;
  major: string;
  year: string;
};

type ResumeData = {
  fullName: string;
  email: string;
  phone: string;
  university: string;
  major: string;
  year: string;
  skills: string;
  summary: string;
};

export default function Home () {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      from: 'bot',
      text: 'Hi! I am InternFlow AI Bot. Ask me anything about your internship journey.',
      timestamp: new Date().toISOString()
    }
  ]);
  const [isSending, setIsSending] = useState(false);
  const [apiError, setApiError] = useState('');
  const [lastPrompt, setLastPrompt] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const { data: session, status } = useSession();
  const isLoadingSession = status === 'loading';
  const isLoggedIn = !!session?.user?.email;

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    university: '',
    major: '',
    year: ''
  });

  const [skillSearch, setSkillSearch] = useState('intern');
  const [learningCourses, setLearningCourses] = useState<string[]>(['Java', 'DDCO', 'Verilog']);
  const [newCourse, setNewCourse] = useState('');
  const [skillProgress, setSkillProgress] = useState<{ name: string; progress: number }[]>([
    { name: 'Java Development', progress: 85 },
    { name: 'Digital Design (DDCO)', progress: 45 },
    { name: 'Verilog Basics', progress: 20 }
  ]);

  const [resumeData, setResumeData] = useState<ResumeData>({
    fullName: '',
    email: '',
    phone: '',
    university: '',
    major: '',
    year: '',
    skills: '',
    summary: ''
  });
  const [generatedResume, setGeneratedResume] = useState('');
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [isGeneratingInterview, setIsGeneratingInterview] = useState(false);

  type LiveInternship = {
    id: number;
    title: string;
    company: string;
    location: string;
    url: string;
    category: string;
    publication_date: string;
    job_type?: string;
    salary?: string;
  };

  const [liveInternships, setLiveInternships] = useState<LiveInternship[]>([]);
  const [liveInternshipsLoading, setLiveInternshipsLoading] = useState(false);
  const [liveInternshipsError, setLiveInternshipsError] = useState('');
  const [liveInternshipQuery, setLiveInternshipQuery] = useState('intern');
  const [savedJobIds, setSavedJobIds] = useState<number[]>([]);
  const [applicationStatus, setApplicationStatus] = useState<Record<number, 'Saved' | 'Applied' | 'Interview' | 'Offer'>>({});

  const skillGapSuggestions = useMemo(() => {
    const userSkills = resumeData.skills
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const marketKeywords = new Set<string>();
    liveInternships.forEach((job) => {
      job.title.toLowerCase().split(/\W+/).forEach((word) => marketKeywords.add(word));
      job.category.toLowerCase().split(/\W+/).forEach((word) => marketKeywords.add(word));
    });

    const baseline = ['git', 'docker', 'sql', 'linux', 'aws', 'communication', 'testing', 'teamwork'];
    const inferred = Array.from(marketKeywords).filter((skill) => skill && skill.length > 2 && !userSkills.includes(skill));

    return Array.from(new Set([...baseline, ...inferred])).filter((skill) => !userSkills.includes(skill)).slice(0, 6);
  }, [resumeData.skills, liveInternships]);

  useEffect(() => {
    const saved = localStorage.getItem('internflow-chat-history');
    if (saved) {
      try {
        const data: Message[] = JSON.parse(saved);
        setMessages(data);
      } catch {
        // ignore invalid data
      }
    }

    const theme = localStorage.getItem('internflow-theme');
    if (theme === 'dark') {
      setDarkMode(true);
    }

    const storedUser = localStorage.getItem('internflow-user');
    if (storedUser) {
      try {
        const savedUser: UserProfile = JSON.parse(storedUser);
        setUserProfile(savedUser);
      } catch {
        // ignore invalid data
      }
    }

    if (session?.user) {
      const userMeta = session.user as { university?: string; major?: string; year?: string };
      setUserProfile({
        name: session.user.name || '',
        email: session.user.email || '',
        university: userMeta.university || '',
        major: userMeta.major || '',
        year: userMeta.year || ''
      });
    }

    const storedResume = localStorage.getItem('internflow-resume');
    if (storedResume) {
      setGeneratedResume(storedResume);
    }

    (async () => {
      await loadJobTracker();
    })();
  }, [session]);

  useEffect(() => {
    localStorage.setItem('internflow-chat-history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('internflow-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('internflow-user', JSON.stringify(userProfile));
    } else {
      localStorage.removeItem('internflow-user');
    }
  }, [isLoggedIn, userProfile]);

  useEffect(() => {
    if (generatedResume) {
      localStorage.setItem('internflow-resume', generatedResume);
    }
  }, [generatedResume]);

  const addNewCourse = () => {
    const trimmed = newCourse.trim();
    if (!trimmed) return;

    if (learningCourses.includes(trimmed)) {
      setNewCourse('');
      return;
    }

    setLearningCourses((prev) => [...prev, trimmed]);
    setSkillProgress((prev) => [...prev, { name: trimmed, progress: 10 }]);
    setNewCourse('');
  };

  const increaseProgress = (courseName: string) => {
    setSkillProgress((prev) =>
      prev.map((entry) => (entry.name === courseName ? { ...entry, progress: Math.min(100, entry.progress + 10) } : entry))
    );
  };

  const sendChat = async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const userMessage: Message = { from: 'user', text: trimmed, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setLastPrompt(trimmed);
    setIsSending(true);
    setApiError('');

    const botPlaceholder: Message = { from: 'bot', text: '', timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, botPlaceholder]);

    try {
      const response = await fetch('/api/chat?stream=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmed })
      });

      if (!response.ok || !response.body) {
        const error = await response.text();
        throw new Error(error || 'Chat API failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        botText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          const lastIndex = next.map((m) => m.from).lastIndexOf('bot');
          if (lastIndex >= 0) {
            next[lastIndex] = { ...next[lastIndex], text: botText };
          }
          return next;
        });
      }

      // ensure final flush
      setMessages((prev) => {
        const next = [...prev];
        const lastIndex = next.map((m) => m.from).lastIndexOf('bot');
        if (lastIndex >= 0) {
          next[lastIndex] = { ...next[lastIndex], text: botText || 'Sorry, no response received.' };
        }
        return next;
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setApiError(`Failed to get response: ${message}`);
      setMessages((prev) => [...prev, { from: 'bot', text: 'Oops! Something went wrong while contacting the AI service.', timestamp: new Date().toISOString() }]);
    } finally {
      setIsSending(false);
    }
  };

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendChat(chatInput);
  };

  const handleInputKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      await sendChat(chatInput);
    }
  };

  const quickPhrases = [
    'How do I improve my Java skill progress?',
    'What internship roles should I apply for?',
    'Give me tips for a coding interview.',
    'How can I write a better resume for an FPGA internship?'
  ];

  const skillTrend = [
    { week: 'Week 1', Java: 75, DDCO: 40, Verilog: 25 },
    { week: 'Week 2', Java: 80, DDCO: 45, Verilog: 30 },
    { week: 'Week 3', Java: 83, DDCO: 50, Verilog: 33 },
    { week: 'Week 4', Java: 85, DDCO: 55, Verilog: 36 }
  ];

  const internshipMatchData = [
    { label: 'Applied', value: 14 },
    { label: 'Interview', value: 6 },
    { label: 'Offer', value: 2 },
    { label: 'Pending', value: 3 }
  ];

  const sendQuickPhrase = (phrase: string) => {
    setChatInput(phrase);
  };

  const fetchLiveInternships = async (query: string) => {
    setLiveInternshipsLoading(true);
    setLiveInternshipsError('');

    try {
      const encodedQuery = encodeURIComponent(query.trim() || 'intern');
      const resp = await fetch(`/api/internships?q=${encodedQuery}`);

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(errText || 'Failed to fetch internships');
      }

      const data = await resp.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setLiveInternships(data.internships || []);
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : 'Unknown error fetching internships';
      setLiveInternshipsError(errMessage);
      setLiveInternships([]);
    } finally {
      setLiveInternshipsLoading(false);
    }
  };

  const loadJobTracker = async () => {
    try {
      const resp = await fetch('/api/job-tracker');
      if (!resp.ok) return;
      const data = await resp.json();
      const jobs = Array.isArray(data.jobs) ? data.jobs : [];
      type TrackerJob = { id: number; status: 'Saved' | 'Applied' | 'Interview' | 'Offer' };
      const typedJobs = jobs as TrackerJob[];
      setSavedJobIds(typedJobs.map((j) => j.id));
      setApplicationStatus(
        typedJobs.reduce<Record<number, 'Saved' | 'Applied' | 'Interview' | 'Offer'>>((acc, job) => {
          acc[job.id] = job.status;
          return acc;
        }, {})
      );
    } catch (err) {
      console.error('Failed to load job tracker:', err);
    }
  };

  const syncJobTracker = async (payload: {
    id: number;
    title: string;
    company: string;
    location: string;
    url: string;
    status: 'Saved' | 'Applied' | 'Interview' | 'Offer';
  }) => {
    try {
      const resp = await fetch('/api/job-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) {
        const errorMessage = await resp.text();
        throw new Error(errorMessage);
      }
      return true;
    } catch (error) {
      console.error('Failed to sync job tracker entry', error);
      return false;
    }
  };

  const deleteJobTracker = async (id: number) => {
    try {
      await fetch(`/api/job-tracker?id=${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Failed to delete job tracker entry', error);
    }
  };

  const toggleSaveJob = async (jobId: number) => {
    const isSaved = savedJobIds.includes(jobId);
    const nextSaved = isSaved ? savedJobIds.filter((id) => id !== jobId) : [...savedJobIds, jobId];

    if (isSaved) {
      await deleteJobTracker(jobId);
      setSavedJobIds(nextSaved);
      setApplicationStatus((prev) => {
        const newStatus = { ...prev };
        delete newStatus[jobId];
        return newStatus;
      });
      return;
    }

    const job = liveInternships.find((item) => item.id === jobId);
    const payload = {
      id: jobId,
      title: job?.title ?? 'Unknown role',
      company: job?.company ?? 'Unknown',
      location: job?.location ?? 'Remote',
      url: job?.url ?? '#',
      status: 'Saved' as const
    };
    const saved = await syncJobTracker(payload);
    if (saved) {
      setSavedJobIds(nextSaved);
      setApplicationStatus((prev) => ({ ...prev, [jobId]: 'Saved' }));
    }
  };

  const setJobStatus = async (jobId: number, status: 'Saved' | 'Applied' | 'Interview' | 'Offer') => {
    const job = liveInternships.find((item) => item.id === jobId);
    const payload = {
      id: jobId,
      title: job?.title ?? 'Unknown role',
      company: job?.company ?? 'Unknown',
      location: job?.location ?? 'Remote',
      url: job?.url ?? '#',
      status
    };

    const synced = await syncJobTracker(payload);
    if (synced) {
      setSavedJobIds((prev) => (prev.includes(jobId) ? prev : [...prev, jobId]));
      setApplicationStatus((prev) => ({ ...prev, [jobId]: status }));
    }
  };

  useEffect(() => {
    fetchLiveInternships(liveInternshipQuery);
  }, [liveInternshipQuery]);

  const generateResume = () => {
    const text = `Name: ${resumeData.fullName}\nEmail: ${resumeData.email}\nPhone: ${resumeData.phone}\nUniversity: ${resumeData.university}\nMajor: ${resumeData.major}\nYear: ${resumeData.year}\nSkills: ${resumeData.skills}\nSummary: ${resumeData.summary}`;
    setGeneratedResume(text);
  };

  const downloadResume = () => {
    const blob = new Blob([generatedResume], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'internflow_resume.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadResumePDF = () => {
    if (!generatedResume) return;

    // The browser doesn't provide a direct PDF constructor by default.
    // As a lightweight fallback, save text content with .pdf extension.
    const blob = new Blob([generatedResume], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'internflow_resume.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateInterviewQuestions = () => {
    setIsGeneratingInterview(true);

    const skills = resumeData.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const questions = [
      'Tell us about a technical problem you solved using your strongest skill.',
      'Describe a team project and the part you owned end-to-end.',
      'How do you debug an issue in a complex codebase?',
      'What is your approach to writing clean, maintainable code?',
    ];

    skills.forEach((skill) => {
      const lower = skill.toLowerCase();
      if (lower.includes('java')) {
        questions.push('Explain Java memory management and garbage collection behavior.');
      }
      if (lower.includes('verilog') || lower.includes('digital')) {
        questions.push('How do you design and verify a synchronous digital circuit in Verilog?');
      }
      if (lower.includes('react') || lower.includes('frontend')) {
        questions.push('How do you manage state in React and avoid unnecessary re-renders?');
      }
      if (lower.includes('python') || lower.includes('ml') || lower.includes('data')) {
        questions.push('Describe your process for training and validating an ML model.');
      }
      if (lower.includes('sql') || lower.includes('database')) {
        questions.push('How would you optimize a slow SQL query joining large tables?');
      }
    });

    setInterviewQuestions([...new Set(questions)].slice(0, 10));
    setIsGeneratingInterview(false);
  };

  return (
    <main
      className={`min-h-screen font-sans relative overflow-hidden ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}
      style={{
        background: darkMode
          ? 'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.28), rgba(17,24,39,0.88) 45%), radial-gradient(circle at 80% 15%, rgba(147,51,234,0.22), transparent 45%), linear-gradient(135deg, #020617 0%, #0f172a 100%)'
          : 'radial-gradient(circle at 25% 30%, rgba(96,165,250,0.2), transparent 35%), radial-gradient(circle at 80% 15%, rgba(167,139,250,0.2), transparent 40%), linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)'
      }}
    >
      
      {/* 1. NAVIGATION BAR */}
      <nav className={`w-full border-b sticky top-0 z-10 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-black text-blue-600 tracking-tighter">INTERNFLOW</h1>
          <div className="hidden md:flex space-x-8 font-medium text-gray-600 text-sm uppercase tracking-wider">
            <a href="#" className="hover:text-blue-600 transition">Dashboard</a>
            <a href="#" className="hover:text-blue-600 transition">Learning Path</a>
            <a href="#" className="hover:text-blue-600 transition">Jobs</a>
          </div>
                  <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className="px-3 py-2 rounded-full border text-sm font-semibold transition hover:bg-blue-50"
            >
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            {isLoadingSession ? (
              <span className="text-sm text-gray-500">Checking login...</span>
            ) : isLoggedIn ? (
              <button onClick={() => signOut()} className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-red-600 shadow-md transition">
                Logout
              </button>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="bg-green-500 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-green-600 shadow-md transition">
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl">
              <h3 className="text-xl font-bold mb-3">Login to InternFlow</h3>
              <p className="text-sm text-gray-500 mb-4">Set your profile and save resume history securely in localStorage.</p>
              <input
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="Full Name (optional)"
                className="w-full mb-3 p-2 border rounded-lg"
              />
              <input
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Email"
                className="w-full mb-3 p-2 border rounded-lg"
              />
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Password"
                className="w-full mb-3 p-2 border rounded-lg"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowLoginModal(false)} className="px-3 py-2 rounded-lg border">Cancel</button>
                <button
                  onClick={async () => {
                    if (!loginEmail.trim() || !loginPassword.trim()) return;
                    const result = await signIn('credentials', {
                      redirect: false,
                      email: loginEmail.trim(),
                      password: loginPassword.trim()
                    });

                    if (result?.ok) {
                      setShowLoginModal(false);
                      setLoginName('');
                      setLoginEmail('');
                      setLoginPassword('');
                    }
                  }}
                  className="px-3 py-2 rounded-lg bg-blue-600 text-white"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. HERO & SEARCH SECTION */}
        <section className="text-center mb-16 fade-in">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-blue-600">
            <span className="uppercase">SMART PATH</span>
            <span className="uppercase"> TOWARDS YOUR </span>
            <span>Dream Internship.</span>
          </h2>
          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
            Our AI analyzes your VTU coursework and skill progress to match you with 
            the perfect industry opportunities.
          </p>
          <div className="relative max-w-2xl mx-auto group">
            <input
              type="text"
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              placeholder="Search by skill (e.g. Verilog, Java, React)..."
              className={`w-full p-6 rounded-2xl border-2 shadow-xl focus:outline-none text-lg transition-all ${darkMode ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-400' : 'border-gray-100 bg-white text-gray-900 placeholder-gray-400'}`}
            />
            <button
              onClick={() => {
                setLiveInternshipQuery(skillSearch || 'intern');
                fetchLiveInternships(skillSearch || 'intern');
              }}
              className="absolute right-3 top-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl active:scale-95"
            >
              Search
            </button>
          </div>
        </section>

        {/* 2a. PROGRESSION ACTIONS */}
        <section className="mb-12 fade-in">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Resume Builder', desc: 'Generate a polished resume tailored to your internship goals.', icon: '📝' },
              { title: 'Interview Prep', desc: 'AI-driven question bank and mock interview chat.', icon: '🎤' },
              { title: 'Skill Gap Audit', desc: 'Identify skill gaps fast, then track your learning path.', icon: '🔎' },
              { title: 'Company Matches', desc: 'Daily updates for internships matching your profile.', icon: '📌' }
            ].map((card) => (
              <div key={card.title} className={`p-4 rounded-2xl glass-card ${darkMode ? 'glass-card-dark' : ''} shadow-sm transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.012] hover:shadow-[0_16px_40px_rgba(59,130,246,0.25)]`}> 
                <h4 className="text-2xl">{card.icon}</h4>
                <h3 className={`mt-3 font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>{card.title}</h3>
                <p className={`mt-1 text-sm ${darkMode ? 'text-slate-300' : 'text-gray-500'}`}>{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2b. RESUME GENERATOR */}
        <section className="max-w-5xl mx-auto mb-12 p-6 rounded-3xl glass-card fade-in">
          <h3 className='text-xl font-bold mb-4'>AI Resume Generator</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {[
                { key: 'fullName', label: 'Full Name', type: 'text' },
                { key: 'email', label: 'Email', type: 'email' },
                { key: 'phone', label: 'Phone', type: 'tel' },
                { key: 'university', label: 'University', type: 'text' },
                { key: 'major', label: 'Major', type: 'text' },
                { key: 'year', label: 'Year', type: 'text' }
              ].map((field) => (
                <input
                  key={field.key}
                  value={resumeData[field.key as keyof ResumeData]}
                  onChange={(e) => setResumeData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.label}
                  type={field.type}
                  className='w-full p-3 rounded-xl border border-gray-300 bg-white/75 text-sm focus:ring-2 focus:ring-blue-500 outline-none '
                />
              ))}
            </div>
            <div className='space-y-3'>
              <textarea
                value={resumeData.summary}
                onChange={(e) => setResumeData((prev) => ({ ...prev, summary: e.target.value }))}
                placeholder='Professional Summary'
                rows={6}
                className='w-full p-3 rounded-xl border border-gray-300 bg-white/75 text-sm focus:ring-2 focus:ring-blue-500 outline-none'
              />
              <input
                value={resumeData.skills}
                onChange={(e) => setResumeData((prev) => ({ ...prev, skills: e.target.value }))}
                placeholder='Skills (comma separated)'
                className='w-full p-3 rounded-xl border border-gray-300 bg-white/75 text-sm focus:ring-2 focus:ring-blue-500 outline-none'
              />
              <div className='flex gap-2'>
                <button
                  onClick={generateResume}
                  className='flex-1 px-4 py-2 rounded-xl text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:brightness-110 active:scale-95 transition'
                  type='button'
                >
                  Generate Resume
                </button>
                <button
                  onClick={downloadResume}
                  disabled={!generatedResume}
                  className='flex-1 px-4 py-2 rounded-xl text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:brightness-110 active:scale-95 transition disabled:opacity-50'
                  type='button'
                >
                  Download TXT
                </button>
                <button
                  onClick={downloadResumePDF}
                  disabled={!generatedResume}
                  className='flex-1 px-4 py-2 rounded-xl text-white bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:brightness-110 active:scale-95 transition disabled:opacity-50'
                  type='button'
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
          {generatedResume && (
            <div className='mt-4 p-4 rounded-xl bg-white/70 border border-gray-200 text-sm whitespace-pre-wrap text-gray-900'>
              {generatedResume}
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 fade-in">
          
          {/* 3. SIDEBAR: LEARNING PROGRESS */}
          <aside className="lg:col-span-1 space-y-6">
            <div className={`p-6 rounded-3xl glass-card ${darkMode ? 'glass-card-dark border-slate-700' : 'border-white/30'} shadow-sm`}> 
              {isLoggedIn ? (
                <div className="mb-4 p-3 rounded-xl bg-white/20">
                  <h4 className="text-sm font-bold">Welcome, {userProfile.name || 'Intern'}</h4>
                  <p className="text-xs text-gray-200">{userProfile.email}</p>
                  <p className="text-xs text-gray-200">{userProfile.major} - {userProfile.year}</p>
                </div>
              ) : (
                <div className="mb-4 p-3 rounded-xl bg-white/20 text-xs text-gray-200">Login to enable profile-based suggestions and resume tracking.</div>
              )}
              <h3 className={`font-bold mb-6 flex items-center ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>
                <span className="mr-2">📈</span> Learning Progress
              </h3>
              
              <div className="space-y-4">
                {skillProgress.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between text-xs font-bold uppercase text-gray-400 mb-2">
                      <span>{item.name}</span>
                      <span>{item.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${item.progress}%`, backgroundColor: item.progress > 75 ? '#22c55e' : item.progress > 45 ? '#6366f1' : '#f97316' }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => increaseProgress(item.name)}
                      className="mt-2 text-[10px] px-2 py-1 rounded-full bg-blue-100 text-blue-700"
                    >
                      + Improve
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  placeholder="New course"
                  className="flex-1 px-2 py-1 rounded-lg border border-gray-300 bg-white/90 text-xs outline-none"
                />
                <button
                  onClick={addNewCourse}
                  className="px-3 py-1 text-xs rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
                  type="button"
                >
                  Add
                </button>
              </div>
            </div>
          </aside>

          {/* 4. MAIN FEED: INTERNSHIP MATCHES */}
          <section className="lg:col-span-2">
            <h3 className="font-bold text-gray-800 mb-6 text-xl">Top Matches for You</h3>
            <div className="space-y-4">
              
              {/* Card 1 */}
              <div className={`p-6 rounded-3xl glass-card ${darkMode ? 'glass-card-dark border-slate-700' : 'border-white/30'} shadow-sm transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_18px_40px_rgba(59,130,246,0.25)] group`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-md uppercase">98% Match</span>
                    <h4 className={`text-xl font-bold mt-2 ${darkMode ? 'text-slate-100' : 'text-gray-800'} transition`}>Frontend Engineer Intern</h4>
                    <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-500'}`}>InnovateX Labs • Remote</p>
                  </div>
                  <div className={`p-3 rounded-2xl text-2xl ${darkMode ? 'bg-indigo-900' : 'bg-blue-50'}`}>⚡</div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="bg-white/70 dark:bg-slate-800/70 text-gray-600 px-3 py-1 rounded-lg text-xs font-medium">React.js</span>
                  <span className="bg-white/70 dark:bg-slate-800/70 text-gray-600 px-3 py-1 rounded-lg text-xs font-medium">Tailwind CSS</span>
                </div>
                <button className="mt-5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg transition duration-200 transform hover:-translate-y-0.5 active:scale-95">
                  Apply
                </button>
              </div>

              {/* Card 2 */}
              <div className={`p-6 rounded-3xl glass-card ${darkMode ? 'glass-card-dark border-slate-700' : 'border-white/30'} shadow-sm transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_18px_40px_rgba(59,130,246,0.25)] group`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-1 rounded-md uppercase">82% Match</span>
                    <h4 className={`text-xl font-bold mt-2 ${darkMode ? 'text-slate-100' : 'text-gray-800'} transition`}>Hardware Verification Trainee</h4>
                    <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-500'}`}>Silicon Systems • Bangalore</p>
                  </div>
                  <div className={`p-3 rounded-2xl text-2xl ${darkMode ? 'bg-indigo-900' : 'bg-purple-50'}`}>📟</div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="bg-white/70 dark:bg-slate-800/70 text-gray-600 px-3 py-1 rounded-lg text-xs font-medium">Verilog</span>
                  <span className="bg-white/70 dark:bg-slate-800/70 text-gray-600 px-3 py-1 rounded-lg text-xs font-medium">Digital Logic</span>
                </div>
                <button className="mt-5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg transition duration-200 transform hover:-translate-y-0.5 active:scale-95">
                  Apply
                </button>
              </div>

            </div>
          </section>

        </div>

        {/* 4a. SKILL TREND & APPLICATION STATS */}
        <section className={`max-w-5xl mx-auto mt-10 p-6 rounded-3xl fade-in ${darkMode ? 'border border-slate-700 bg-slate-900' : 'border border-gray-100 bg-white'} shadow-sm`}>
          <h3 className={`font-bold mb-4 text-xl ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>Skill Trend & Application Flow</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className={`rounded-2xl p-4 ${darkMode ? 'border border-slate-700 bg-slate-800' : 'border border-gray-100 bg-white'}`}>
              <h4 className="font-semibold mb-3">Weekly Skill Growth</h4>
              {skillTrend.map((point) => (
                <div key={point.week} className="mb-2">
                  <div className="flex justify-between text-xs mb-1 text-gray-500">
                    <span>{point.week}</span>
                    <span>Java {point.Java}% | DDCO {point.DDCO}% | Verilog {point.Verilog}%</span>
                  </div>
                  <div className="h-2 grid grid-cols-3 gap-1">
                    <div className="bg-blue-500 rounded-full" style={{ width: `${point.Java}%` }} />
                    <div className="bg-purple-500 rounded-full" style={{ width: `${point.DDCO}%` }} />
                    <div className="bg-orange-400 rounded-full" style={{ width: `${point.Verilog}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className={`rounded-2xl p-4 ${darkMode ? 'border border-slate-700 bg-slate-800' : 'border border-gray-100 bg-white'}`}>
              <h4 className="font-semibold mb-3">Application Funnel</h4>
              <div className="space-y-2">
                {internshipMatchData.map((item) => {
                  const percentage = (item.value / 25) * 100;
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1 text-gray-500">
                        <span>{item.label}</span>
                        <span>{item.value}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {skillGapSuggestions.length > 0 && (
            <div className={`mt-6 p-4 rounded-2xl ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
              <h4 className="font-semibold mb-2">Skill Gap Suggestions</h4>
              <p className="text-xs text-gray-400 mb-2">Based on your resume skills and current internship demand</p>
              <div className="flex flex-wrap gap-2">
                {skillGapSuggestions.map((skill) => (
                  <span key={skill} className="text-[11px] px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    {skill.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 4b. RECOMMENDED INTERNSHIPS */}
        <section className={`max-w-5xl mx-auto mt-6 p-6 rounded-3xl shadow-sm ${darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-100'}`}>
          <h3 className={`font-bold text-xl ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>Recommended Internships</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="md:col-span-2 flex flex-wrap gap-2">
              <input
                value={liveInternshipQuery}
                onChange={(e) => setLiveInternshipQuery(e.target.value)}
                placeholder="Search internships (e.g., Java, Verilog, React)"
                className="flex-1 min-w-[220px] px-3 py-2 rounded-xl border border-gray-300 bg-white/90 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={() => fetchLiveInternships(liveInternshipQuery)}
                className="px-4 py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition active:scale-95"
                type="button"
              >
                Refresh
              </button>
              <button
                onClick={generateInterviewQuestions}
                disabled={!resumeData.skills.trim() || isGeneratingInterview}
                className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:brightness-110 active:scale-95 transition disabled:opacity-50"
                type="button"
              >
                {isGeneratingInterview ? 'Generating ⋯' : 'Generate Interview Questions'}
              </button>
            </div>
            <div className="flex items-center justify-end">
              <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-500'}`}>
                Showing live internships from Remotive API
              </span>
            </div>
          </div>

          {liveInternshipsError && (
            <div className="mt-4 p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
              {liveInternshipsError}
            </div>
          )}
          {liveInternshipsLoading && (
            <div className="mt-4 text-sm text-blue-600">Loading internships…</div>
          )}
          {!liveInternshipsLoading && savedJobIds.length > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200">
              <h4 className="text-sm font-bold mb-2">Saved Internship Tracker</h4>
              <div className="text-xs text-gray-700">
                {savedJobIds.map((jobId) => {
                  const saved = liveInternships.find((j) => j.id === jobId);
                  const status = applicationStatus[jobId] || 'Saved';
                  return (
                    <div key={jobId} className="mb-1">
                      {saved ? `${saved.title} (${saved.company})` : `Job #${jobId}`} - {status}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {!liveInternshipsLoading && liveInternships.length === 0 && !liveInternshipsError && (
            <p className={`mt-4 ${darkMode ? 'text-slate-300' : 'text-gray-500'}`}>
              No live internships found for this query. Try another one.
            </p>
          )}

          {interviewQuestions.length > 0 && (
            <div className="mt-4 p-4 rounded-xl border border-blue-200 bg-blue-50/50">
              <h4 className="font-semibold mb-2">Interview Question Set</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                {interviewQuestions.map((q, index) => (
                  <li key={`${q}-${index}`} className="text-left">{q}</li>
                ))}
              </ol>
            </div>
          )}

          {liveInternships.length > 0 ? (
            <div className="mt-4 space-y-3">
              {liveInternships.map((job) => {
                const isSaved = savedJobIds.includes(job.id);
                const status = applicationStatus[job.id] || (isSaved ? 'Saved' : 'Saved');

                return (
                  <div key={job.id} className='p-4 rounded-2xl glass-card hover:shadow-md transition'>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className={`font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>{job.title}</h4>
                        <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>{job.company} • {job.location}</p>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{job.category} • {job.job_type || 'Internship'}</p>
                      </div>
                      <span className='text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800'>{new Date(job.publication_date).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => toggleSaveJob(job.id)}
                        type="button"
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${isSaved ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        {isSaved ? 'Unsave' : 'Save'}
                      </button>

                      <select
                        value={status}
                        onChange={(e) => setJobStatus(job.id, e.target.value as 'Saved' | 'Applied' | 'Interview' | 'Offer')}
                        className="text-xs px-2 py-1 rounded-lg border border-gray-300 bg-white"
                      >
                        <option value="Saved">Saved</option>
                        <option value="Applied">Applied</option>
                        <option value="Interview">Interview</option>
                        <option value="Offer">Offer</option>
                      </select>

                      <a
                        href={job.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs px-3 py-1 rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        View
                      </a>
                    </div>
                    <div className="mt-2 text-[11px] text-gray-500">
                      Application status: <span className="font-bold">{status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            !liveInternshipsLoading && (
              <p className={`mt-3 ${darkMode ? 'text-slate-300' : 'text-gray-500'}`}>
                No live internships available right now. Try a broader keyword.
              </p>
            )
          )}
        </section>

      </div>

      {/* 5. AI CHATBOT FLOATING ACTION WIDGET */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3">
        {isChatOpen && (
          <div className="w-[320px] h-[430px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
              <h4 className="text-sm font-bold">InternFlow AI Chat</h4>
              <button onClick={() => setIsChatOpen(false)} className="text-white text-xs font-bold px-2 py-1 rounded-md hover:bg-blue-500 transition">Close</button>
            </div>
            <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-slate-50" style={{scrollBehavior: 'smooth'}}>
              {messages.map((msg, index) => (
                <div key={`${msg.from}-${index}`} className={`rounded-lg p-2 max-w-[85%] ${msg.from === 'user' ? 'bg-blue-100 text-slate-800 ml-auto' : 'bg-gray-100 text-gray-700'}`}>
                  <div className="flex justify-between text-xs uppercase tracking-wide text-gray-500">
                    <span>{msg.from === 'user' ? 'You' : 'Bot'}</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-sm mt-1">{msg.text}</p>
                </div>
              ))}
            </div>
            <div className="px-3 pb-2">
              <div className="flex flex-wrap gap-1">
                {quickPhrases.map((phrase) => (
                  <button
                    key={phrase}
                    type="button"
                    onClick={() => sendQuickPhrase(phrase)}
                    className="text-xs px-2 py-1 border border-gray-300 rounded-lg bg-white hover:bg-blue-50"
                  >
                    {phrase}
                  </button>
                ))}
              </div>
              {isSending && (
                <p className="text-xs text-blue-600 mt-1">AI is typing...</p>
              )}
              {apiError && (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-red-600">{apiError}</p>
                  {lastPrompt && (
                    <button
                      type="button"
                      onClick={() => { setChatInput(lastPrompt); setApiError(''); }}
                      className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200"
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}
            </div>
            <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Type a message..."
                className="flex-1 border rounded-xl px-3 py-2 text-sm outline-none border-gray-300 focus:border-blue-500"
              />
              <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                Send
              </button>
            </form>
          </div>
        )}
        <button
          onClick={() => setIsChatOpen((open) => !open)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-full shadow-2xl hover:bg-blue-700 transition active:scale-95"
        >
          <span className="text-lg">💬</span>
          <span className="font-bold text-sm">AI Help</span>
        </button>
      </div>

      <style jsx global>{`
        .fade-in {
          opacity: 0;
          transform: translateY(14px);
          animation: fadeIn 0.8s ease-out forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.28);
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.15);
        }

        .glass-card-dark {
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(148, 163, 184, 0.25);
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.25);
        }
      `}</style>
    </main>
  );
}