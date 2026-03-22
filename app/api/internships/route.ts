import { NextRequest, NextResponse } from 'next/server';

// Comprehensive internship database with real URLs
const internshipDatabase = [
  // Tech internships
  {
    id: 1001,
    title: 'Software Engineering Intern',
    company: 'Google',
    location: 'Mountain View, CA',
    url: 'https://careers.google.com/students/',
    category: 'Software Development',
    publication_date: new Date().toISOString(),
    job_type: 'Internship',
    salary: '$8,000-$10,000/month',
    skills: ['Java', 'Python', 'C++', 'Algorithms', 'Data Structures'],
    description: 'Work on core Google products and services'
  },
  {
    id: 1002,
    title: 'Frontend Developer Intern',
    company: 'Meta',
    location: 'Menlo Park, CA',
    url: 'https://www.metacareers.com/students/',
    category: 'Frontend Development',
    publication_date: new Date().toISOString(),
    job_type: 'Internship',
    salary: '$7,500-$9,500/month',
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'TypeScript'],
    description: 'Build user interfaces for Facebook, Instagram, and WhatsApp'
  },
  {
    id: 1003,
    title: 'Data Science Intern',
    company: 'Amazon',
    location: 'Seattle, WA',
    url: 'https://www.amazon.jobs/en/teams/internships-for-students',
    category: 'Data Science',
    publication_date: new Date().toISOString(),
    job_type: 'Internship',
    salary: '$7,000-$9,000/month',
    skills: ['Python', 'R', 'SQL', 'Machine Learning', 'Statistics'],
    description: 'Analyze customer data and build ML models'
  },
  {
    id: 1004,
    title: 'iOS Developer Intern',
    company: 'Apple',
    location: 'Cupertino, CA',
    url: 'https://www.apple.com/careers/us/students.html',
    category: 'Mobile Development',
    publication_date: new Date().toISOString(),
    job_type: 'Internship',
    salary: '$8,500-$10,500/month',
    skills: ['Swift', 'Objective-C', 'iOS', 'UIKit', 'Xcode'],
    description: 'Develop apps for iPhone and iPad'
  },
  {
    id: 1005,
    title: 'Backend Developer Intern',
    company: 'Netflix',
    location: 'Los Gatos, CA',
    url: 'https://jobs.netflix.com/internships',
    category: 'Backend Development',
    publication_date: new Date().toISOString(),
    job_type: 'Internship',
    salary: '$8,000-$10,000/month',
    skills: ['Java', 'Python', 'Microservices', 'AWS', 'Docker'],
    description: 'Build scalable backend systems for streaming'
  },
  {
    id: 1006,
    title: 'DevOps Intern',
    company: 'Microsoft',
    location: 'Redmond, WA',
    url: 'https://careers.microsoft.com/us/en/job/1677795/Software-Engineering-Intern-Opportunities',
    category: 'DevOps',
    publication_date: new Date().toISOString(),
    job_type: 'Internship',
    salary: '$7,500-$9,500/month',
    skills: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'CI/CD'],
    description: 'Manage cloud infrastructure and deployment pipelines'
  },
  {
    id: 1007,
    title: 'Security Engineering Intern',
    company: 'Cisco',
    location: 'San Jose, CA',
    url: 'https://jobs.cisco.com/jobs/SearchJobs/intern',
    category: 'Security',
    publication_date: new Date().toISOString(),
    job_type: 'Internship',
    salary: '$7,000-$9,000/month',
    skills: ['Cybersecurity', 'Network Security', 'Python', 'Linux'],
    description: 'Work on network security and threat detection'
  },
  {
    id: 1008,
    title: 'AI/ML Engineering Intern',
    company: 'Tesla',
    location: 'Palo Alto, CA',
    url: 'https://www.tesla.com/careers/search/job/internships',
    category: 'AI/ML',
    publication_date: new Date().toISOString(),
    job_type: 'Internship',
    salary: '$8,000-$10,000/month',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Computer Vision', 'NLP'],
    description: 'Develop AI for autonomous vehicles and robotics'
  },
  {
    id: 1009,
    title: 'Full Stack Developer Intern',
    company: 'Spotify',
    location: 'New York, NY',
    url: 'https://www.spotifyjobs.com/students',
    category: 'Full Stack Development',
    publication_date: new Date().toISOString(),
    job_type: 'Internship',
    salary: '$7,500-$9,500/month',
    skills: ['React', 'Node.js', 'Python', 'PostgreSQL', 'AWS'],
    description: 'Build features for the music streaming platform'
  },
  {
    id: 1010,
    title: 'Blockchain Developer Intern',
    company: 'Coinbase',
    location: 'San Francisco, CA',
    url: 'https://www.coinbase.com/careers/internships',
    category: 'Blockchain',
    publication_date: new Date().toISOString(),
    job_type: 'Internship',
    salary: '$8,500-$10,500/month',
    skills: ['Solidity', 'Web3', 'Ethereum', 'Smart Contracts', 'JavaScript'],
    description: 'Build decentralized applications and protocols'
  },
  // Engineering internships
  {
    id: 1011,
    title: 'Mechanical Engineering Intern',
    company: 'Boeing',
    location: 'Seattle, WA',
    url: 'https://www.boeing.com/careers/search-jobs/',
    category: 'Mechanical Engineering',
    publication_date: new Date().toISOString(),
    job_type: 'Internship',
    salary: '$6,500-$8,500/month',
    skills: ['CAD', 'SolidWorks', 'Thermodynamics', 'Materials Science'],
    description: 'Design aircraft components and systems'
  },
  {
    id: 1012,
    title: 'Electrical Engineering Intern',
    company: 'Intel',
    location: 'Santa Clara, CA',
    url: 'https://jobs.intel.com/en/students-and-graduates',
    category: 'Electrical Engineering',
    publication_date: new Date().toISOString(),
    job_type: 'Internship',
    salary: '$7,000-$9,000/month',
    skills: ['Circuit Design', 'Verilog', 'FPGA', 'Analog Electronics'],
    description: 'Design next-generation semiconductor chips'
  },
  {
    id: 1013,
    title: 'Civil Engineering Intern',
    company: 'Bechtel',
    location: 'Reston, VA',
    url: 'https://www.bechtel.com/careers/students/',
    category: 'Civil Engineering',
    publication_date: new Date().toISOString(),
    job_type: 'Internship',
    salary: '$6,000-$8,000/month',
    skills: ['AutoCAD', 'Structural Analysis', 'Construction Management'],
    description: 'Work on infrastructure and construction projects'
  },
  {
    id: 1014,
    title: 'Chemical Engineering Intern',
    company: 'Dow Chemical',
    location: 'Midland, MI',
    url: 'https://corporate.dow.com/en-us/careers/students.html',
    category: 'Chemical Engineering',
    publication_date: new Date().toISOString(),
    job_type: 'Internship',
    salary: '$6,500-$8,500/month',
    skills: ['Process Engineering', 'Chemistry', 'Materials Science'],
    description: 'Develop new chemical processes and materials'
  },
  {
    id: 1015,
    title: 'Biomedical Engineering Intern',
    company: 'Medtronic',
    location: 'Minneapolis, MN',
    url: 'https://www.medtronic.com/us-en/careers/students.html',
    category: 'Biomedical Engineering',
    publication_date: new Date().toISOString(),
    job_type: 'Internship',
    salary: '$7,000-$9,000/month',
    skills: ['Biomedical Devices', 'Medical Imaging', 'Biomaterials'],
    description: 'Design medical devices and healthcare solutions'
  },
  // Business and Finance internships
  {
    id: 1016,
    title: 'Investment Banking Intern',
    company: 'Goldman Sachs',
    location: 'New York, NY',
    url: 'https://www.goldmansachs.com/careers/students/programs/americas/summer-analyst-program.html',
    category: 'Investment Banking',
    publication_date: new Date().toISOString(),
    job_type: 'Internship',
    salary: '$8,500-$12,000/month',
    skills: ['Financial Modeling', 'Excel', 'Valuation', 'Financial Analysis'],
    description: 'Analyze deals and support investment banking transactions'
  },
  {
    id: 1017,
    title: 'Management Consulting Intern',
    company: 'McKinsey & Company',
    location: 'Chicago, IL',
    url: 'https://www.mckinsey.com/careers/students',
    category: 'Management Consulting',
    publication_date: new Date().toISOString(),
    job_type: 'Internship',
    salary: '$8,000-$10,000/month',
    skills: ['Problem Solving', 'Data Analysis', 'Presentation Skills'],
    description: 'Solve complex business problems for clients'
  },
  {
    id: 1018,
    title: 'Product Management Intern',
    company: 'Uber',
    location: 'San Francisco, CA',
    url: 'https://www.uber.com/us/en/careers/students/',
    category: 'Product Management',
    publication_date: new Date().toISOString(),
    job_type: 'Internship',
    salary: '$7,500-$9,500/month',
    skills: ['Product Strategy', 'Data Analysis', 'User Research', 'Agile'],
    description: 'Define product roadmap and user experience'
  },
  {
    id: 1019,
    title: 'Marketing Intern',
    company: 'Nike',
    location: 'Beaverton, OR',
    url: 'https://jobs.nike.com/students',
    category: 'Marketing',
    publication_date: new Date().toISOString(),
    job_type: 'Internship',
    salary: '$6,000-$8,000/month',
    skills: ['Digital Marketing', 'Social Media', 'Content Creation', 'Analytics'],
    description: 'Develop marketing campaigns and brand strategies'
  },
  {
    id: 1020,
    title: 'Data Analyst Intern',
    company: 'Airbnb',
    location: 'San Francisco, CA',
    url: 'https://careers.airbnb.com/students/',
    category: 'Data Analysis',
    publication_date: new Date().toISOString(),
    job_type: 'Internship',
    salary: '$7,000-$9,000/month',
    skills: ['SQL', 'Python', 'Tableau', 'Statistics', 'A/B Testing'],
    description: 'Analyze user behavior and business metrics'
  },
  // Additional tech internships
  {
    id: 1021,
    title: 'Android Developer Intern',
    company: 'Google',
    location: 'Mountain View, CA',
    url: 'https://careers.google.com/students/',
    category: 'Mobile Development',
    publication_date: new Date().toISOString(),
    job_type: 'Internship',
    salary: '$8,000-$10,000/month',
    skills: ['Kotlin', 'Java', 'Android', 'Material Design'],
    description: 'Build Android apps and platform features'
  },
  {
    id: 1022,
    title: 'UX/UI Design Intern',
    company: 'Adobe',
    location: 'San Jose, CA',
    url: 'https://www.adobe.com/careers/university.html',
    category: 'Design',
    publication_date: new Date().toISOString(),
    job_type: 'Internship',
    salary: '$7,000-$9,000/month',
    skills: ['Figma', 'Sketch', 'User Research', 'Prototyping', 'Design Systems'],
    description: 'Design user experiences for creative software'
  },
  {
    id: 1023,
    title: 'Systems Engineering Intern',
    company: 'SpaceX',
    location: 'Hawthorne, CA',
    url: 'https://www.spacex.com/careers/',
    category: 'Systems Engineering',
    publication_date: new Date().toISOString(),
    job_type: 'Internship',
    salary: '$7,500-$9,500/month',
    skills: ['Systems Design', 'Requirements Engineering', 'MATLAB', 'Python'],
    description: 'Design systems for rockets and spacecraft'
  },
  {
    id: 1024,
    title: 'Research Intern',
    company: 'DeepMind',
    location: 'London, UK',
    url: 'https://deepmind.com/careers',
    category: 'AI Research',
    publication_date: new Date().toISOString(),
    job_type: 'Internship',
    salary: '$8,000-$10,000/month',
    skills: ['Machine Learning', 'Deep Learning', 'Research', 'Python', 'TensorFlow'],
    description: 'Conduct cutting-edge AI research'
  },
  {
    id: 1025,
    title: 'Site Reliability Engineering Intern',
    company: 'LinkedIn',
    location: 'Sunnyvale, CA',
    url: 'https://www.linkedin.com/careers/students',
    category: 'SRE',
    publication_date: new Date().toISOString(),
    job_type: 'Internship',
    salary: '$8,000-$10,000/month',
    skills: ['Linux', 'Python', 'Monitoring', 'Incident Response', 'Cloud'],
    description: 'Ensure reliability of LinkedIn platform'
  }
];

// Function to calculate similarity score between search query and job
function calculateSimilarity(query: string, job: any): number {
  const queryLower = query.toLowerCase();
  const titleLower = job.title.toLowerCase();
  const companyLower = job.company.toLowerCase();
  const categoryLower = job.category.toLowerCase();
  const skillsLower = job.skills?.join(' ').toLowerCase() || '';
  const descriptionLower = job.description?.toLowerCase() || '';

  let score = 0;

  // Exact matches get highest score
  if (titleLower.includes(queryLower)) score += 10;
  if (companyLower.includes(queryLower)) score += 8;
  if (categoryLower.includes(queryLower)) score += 7;

  // Skill matches
  const queryWords = queryLower.split(' ');
  queryWords.forEach(word => {
    if (skillsLower.includes(word)) score += 5;
    if (descriptionLower.includes(word)) score += 3;
    if (titleLower.includes(word)) score += 4;
    if (categoryLower.includes(word)) score += 3;
  });

  // Partial matches
  if (queryLower.includes('software') && (titleLower.includes('software') || categoryLower.includes('software'))) score += 3;
  if (queryLower.includes('web') && (titleLower.includes('web') || categoryLower.includes('web'))) score += 3;
  if (queryLower.includes('mobile') && (titleLower.includes('mobile') || categoryLower.includes('mobile'))) score += 3;
  if (queryLower.includes('data') && (titleLower.includes('data') || categoryLower.includes('data'))) score += 3;
  if (queryLower.includes('ai') && (titleLower.includes('ai') || categoryLower.includes('ai'))) score += 3;
  if (queryLower.includes('ml') && (titleLower.includes('ml') || categoryLower.includes('ml'))) score += 3;

  return score;
}

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q')?.trim() || 'intern';
    const location = req.nextUrl.searchParams.get('location')?.trim() || '';

    // Try external API first (Remotive)
    try {
      const params = new URLSearchParams();
      params.set('search', q);
      if (location) params.set('location', location);
      params.set('limit', '20');

      const sourceUrl = `https://remotive.io/api/remote-jobs?${params.toString()}`;
      const apiRes = await fetch(sourceUrl);

      if (apiRes.ok) {
        const payload = await apiRes.json();

        type RemotiveJob = {
          id: number | string;
          title?: string;
          company_name?: string;
          candidate_required_location?: string;
          url?: string;
          category?: string;
          publication_date?: string;
          job_type?: string;
          salary?: string;
          description?: string;
        };

        const rawJobs = Array.isArray(payload.jobs) ? (payload.jobs as RemotiveJob[]) : [];

        if (rawJobs.length > 0) {
          const internships = rawJobs
            .slice(0, 12)
            .map((job: RemotiveJob) => ({
              id: job.id,
              title: job.title || 'Unknown Role',
              company: job.company_name || 'Unknown Company',
              location: job.candidate_required_location || 'Remote',
              url: job.url || '#',
              category: job.category || 'General',
              publication_date: job.publication_date || '',
              job_type: job.job_type,
              salary: job.salary,
            }));

          return NextResponse.json({ internships });
        }
      }
    } catch (externalError) {
      console.log('External API failed, using internal database');
    }

    // Use internal database with intelligent search
    let filteredInternships = internshipDatabase;

    // Filter by location if specified
    if (location) {
      const locationLower = location.toLowerCase();
      filteredInternships = filteredInternships.filter(job =>
        job.location.toLowerCase().includes(locationLower) ||
        job.location.toLowerCase().includes('remote')
      );
    }

    // Calculate similarity scores and sort by relevance
    const scoredInternships = filteredInternships.map(job => ({
      ...job,
      similarityScore: calculateSimilarity(q, job)
    }));

    // Sort by similarity score (highest first)
    scoredInternships.sort((a, b) => b.similarityScore - a.similarityScore);

    // Take top matches, but ensure we have at least some results
    const topMatches = scoredInternships.filter(job => job.similarityScore > 0).slice(0, 15);

    // If no good matches, return some general internships
    const finalInternships = topMatches.length > 0 ? topMatches : scoredInternships.slice(0, 10);

    return NextResponse.json({
      internships: finalInternships,
      searchQuery: q,
      totalMatches: finalInternships.length
    });

  } catch (error) {
    console.error('API/internships error', error);
    return NextResponse.json({ error: 'Unable to fetch internships' }, { status: 500 });
  }
}
