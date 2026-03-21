import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

type JobTrackerEntry = {
  id: number;
  title: string;
  company: string;
  location: string;
  url: string;
  status: 'Saved' | 'Applied' | 'Interview' | 'Offer';
  updatedAt: string;
};

const storageDir = path.join(process.cwd(), 'data');
const storageFile = path.join(storageDir, 'job-tracker.json');

async function ensureStorage() {
  try {
    await fs.mkdir(storageDir, { recursive: true });
    await fs.access(storageFile);
  } catch {
    await fs.writeFile(storageFile, JSON.stringify([]), 'utf-8');
  }
}

async function readData(): Promise<JobTrackerEntry[]> {
  await ensureStorage();
  const content = await fs.readFile(storageFile, 'utf-8');
  try {
    return JSON.parse(content) as JobTrackerEntry[];
  } catch {
    return [];
  }
}

async function writeData(data: JobTrackerEntry[]) {
  await ensureStorage();
  await fs.writeFile(storageFile, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  const data = await readData();
  return NextResponse.json({ jobs: data });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body.id !== 'number') {
      return NextResponse.json({ error: 'Invalid payload (id required)' }, { status: 400 });
    }
    const existing = await readData();
    const first = existing.find((item) => item.id === body.id);
    const now = new Date().toISOString();
    const entry: JobTrackerEntry = {
      id: body.id,
      title: body.title ?? 'Unknown',
      company: body.company ?? 'Unknown',
      location: body.location ?? 'Remote',
      url: body.url ?? '#',
      status: body.status || 'Saved',
      updatedAt: now
    };

    let updated;
    if (first) {
      updated = existing.map((item) => (item.id === body.id ? { ...item, ...entry, updatedAt: now } : item));
    } else {
      updated = [...existing, entry];
    }
    await writeData(updated);
    return NextResponse.json({ job: entry });
  } catch {
    return NextResponse.json({ error: 'Failed to save job tracker entry' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body.id !== 'number') {
      return NextResponse.json({ error: 'Invalid payload (id required)' }, { status: 400 });
    }
    const existing = await readData();
    const job = existing.find((item) => item.id === body.id);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    const now = new Date().toISOString();
    const changed: JobTrackerEntry = {
      ...job,
      title: body.title ?? job.title,
      company: body.company ?? job.company,
      location: body.location ?? job.location,
      url: body.url ?? job.url,
      status: body.status ?? job.status,
      updatedAt: now
    };
    const updated = existing.map((item) => (item.id === body.id ? changed : item));
    await writeData(updated);
    return NextResponse.json({ job: changed });
  } catch {
    return NextResponse.json({ error: 'Failed to update job tracker entry' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const idParam = url.searchParams.get('id');
    if (!idParam) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    const id = Number(idParam);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const existing = await readData();
    const updated = existing.filter((item) => item.id !== id);
    await writeData(updated);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete job tracker entry' }, { status: 500 });
  }
}
