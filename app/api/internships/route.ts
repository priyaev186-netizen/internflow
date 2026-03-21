import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q')?.trim() || 'intern';
    const location = req.nextUrl.searchParams.get('location')?.trim() || '';

    const params = new URLSearchParams();
    params.set('search', q);
    if (location) params.set('location', location);
    params.set('limit', '20');

    const sourceUrl = `https://remotive.io/api/remote-jobs?${params.toString()}`;

    const apiRes = await fetch(sourceUrl);
    if (!apiRes.ok) {
      // Fallback static internships when external API is down
      const fallbackInternships = [
        { id: 1001, title: 'Frontend Developer Intern', company: 'Fallback Co', location: 'Remote', url: '#', category: 'Software', publication_date: new Date().toISOString(), job_type: 'Internship', salary: 'Not specified' },
        { id: 1002, title: 'Hardware Verification Intern', company: 'Fallback Co', location: 'Bangalore', url: '#', category: 'Hardware', publication_date: new Date().toISOString(), job_type: 'Internship', salary: 'Not specified' }
      ];
      return NextResponse.json({ internships: fallbackInternships });
    }

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

    const internships = rawJobs
      .filter((job: RemotiveJob) => {
        const title = String(job.title || '').toLowerCase();
        const category = String(job.category || '').toLowerCase();
        const description = String(job.description || '').toLowerCase();
        return title.includes('intern') || category.includes('intern') || description.includes('intern');
      })
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
  } catch (error) {
    console.error('API/internships error', error);
    return NextResponse.json({ error: 'Unable to fetch internships' }, { status: 500 });
  }
}
