import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import Job from '@/models/Job';

export const dynamic = 'force-dynamic';

// GET - Get job status by ID or list all jobs
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    if (jobId) {
      // Get specific job
      const job = await Job.findOne({ _id: jobId, userId: payload.userId });
      if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }
      return NextResponse.json({ job });
    }

    // List all jobs with filters
    const query: any = { userId: payload.userId };
    if (type) query.type = type;
    if (status) query.status = status;

    const jobs = await Job.find(query).sort({ createdAt: -1 }).limit(50);

    return NextResponse.json({ jobs });
  } catch (err: any) {
    console.error('Error fetching jobs:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch jobs' }, { status: 500 });
  }
}

// DELETE - Cancel/delete a job
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    const job = await Job.findOne({ _id: jobId, userId: payload.userId });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // If job is processing, mark it as failed/cancelled to stop it
    if (job.status === 'processing' || job.status === 'pending') {
      job.status = 'failed';
      job.error = 'Job cancelled by user';
      job.completedAt = new Date();
      await job.save();
      return NextResponse.json({ message: 'Job cancelled', job });
    }

    // Delete completed/failed/paused jobs
    await Job.findByIdAndDelete(jobId);
    return NextResponse.json({ message: 'Job deleted' });
  } catch (err: any) {
    console.error('Error deleting job:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete job' }, { status: 500 });
  }
}
