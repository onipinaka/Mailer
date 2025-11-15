import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import Lead from '@/models/Lead';
import Job from '@/models/Job';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

/**
 * Lead Generation - Creates a background job to scrape leads
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { query, location, maxResults = 20, tags = [] } = body || {};

    if (!query) {
      return NextResponse.json({ error: 'query is required (e.g., "restaurants in Pune")' }, { status: 400 });
    }

    // Create a background job for lead generation
    const job = new Job({
      userId: new mongoose.Types.ObjectId(payload.userId),
      type: 'lead_generation',
      status: 'pending',
      totalItems: maxResults,
      data: {
        query,
        location,
        maxResults,
        tags,
      },
    });

    await job.save();

    // Start processing in background
    processLeadGenerationJob(job._id.toString(), payload.userId, query, location, maxResults, tags);

    return NextResponse.json({
      success: true,
      jobId: job._id,
      message: 'Lead generation started. Check job status for progress.',
    });
  } catch (err) {
    console.error('Error generating leads', err);
    return NextResponse.json({ error: 'Failed to generate leads' }, { status: 500 });
  }
}

// Background job processor
async function processLeadGenerationJob(
  jobId: string,
  userId: string,
  query: string,
  location: string | undefined,
  maxResults: number,
  tags: string[]
) {
  try {
    await dbConnect();

    // Update job status
    await Job.findByIdAndUpdate(jobId, {
      status: 'processing',
      startedAt: new Date(),
    });

    const leads: any[] = [];

    // Try using Python scraper first (most reliable)
    try {
      const { spawn } = require('child_process');
      const path = require('path');
      
      const scriptPath = path.join(process.cwd(), 'scripts', 'scrape_google_maps.py');
      const pythonProcess = spawn('python', [scriptPath, query, maxResults.toString()]);

      let scriptOutput = '';
      let jsonOutput = '';
      let isCapturingJson = false;

      pythonProcess.stdout.on('data', (data: Buffer) => {
        const output = data.toString();
        scriptOutput += output;
        
        if (output.includes('===JSON_OUTPUT_START===')) {
          isCapturingJson = true;
          jsonOutput = '';
        } else if (output.includes('===JSON_OUTPUT_END===')) {
          isCapturingJson = false;
        } else if (isCapturingJson) {
          jsonOutput += output;
        }
      });

      pythonProcess.stderr.on('data', (data: Buffer) => {
        console.error('Python stderr:', data.toString());
      });

      await new Promise<void>((resolve, reject) => {
        pythonProcess.on('close', async (code: number) => {
          if (code === 0 && jsonOutput) {
            try {
              const scrapedData = JSON.parse(jsonOutput);
              
              for (const business of scrapedData) {
                const lead = new Lead({
                  userId: new mongoose.Types.ObjectId(userId),
                  businessName: business.name !== 'N/A' ? business.name : 'Unknown',
                  category: business.category || query.split(' ')[0],
                  address: business.address !== 'N/A' ? business.address : undefined,
                  website: business.website !== 'N/A' ? business.website : undefined,
                  phone: business.phone !== 'N/A' ? business.phone : undefined,
                  googleMapsUrl: business.google_maps_url,
                  rating: business.rating !== 'N/A' ? parseFloat(business.rating) : undefined,
                  reviewsCount: business.reviews !== 'N/A' ? parseInt(business.reviews) : 0,
                  tags: [...tags, query.split(' ')[0]],
                  status: 'new',
                  notes: `Hours: ${business.hours}`,
                });

                await lead.save();
                leads.push(lead);

                await Job.findByIdAndUpdate(jobId, {
                  processedItems: leads.length,
                  successCount: leads.length,
                  progress: Math.round((leads.length / maxResults) * 100),
                });
              }
              resolve();
            } catch (err) {
              console.error('Error parsing Python output:', err);
              reject(err);
            }
          } else {
            console.log('Python script output:', scriptOutput);
            reject(new Error('Python script failed or no data returned'));
          }
        });
      });

    } catch (pythonError) {
      console.error('Python scraper failed:', pythonError);
      
      // Fallback to Google Places API if available
      const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
      
      if (googleApiKey) {
        console.log('Falling back to Google Places API');
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${googleApiKey}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (searchData.status === 'OK') {
          for (const place of searchData.results.slice(0, maxResults)) {
            try {
              const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,url&key=${googleApiKey}`;
              const detailsRes = await fetch(detailsUrl);
              const detailsData = await detailsRes.json();

              if (detailsData.status === 'OK') {
                const placeDetails = detailsData.result;

                const lead = new Lead({
                  userId: new mongoose.Types.ObjectId(userId),
                  businessName: placeDetails.name,
                  category: place.types?.[0] || 'business',
                  address: placeDetails.formatted_address,
                  website: placeDetails.website,
                  phone: placeDetails.formatted_phone_number,
                  googleMapsUrl: placeDetails.url,
                  rating: placeDetails.rating,
                  reviewsCount: placeDetails.user_ratings_total || 0,
                  tags: [...tags, query.split(' ')[0]],
                  status: 'new',
                });

                await lead.save();
                leads.push(lead);

                await Job.findByIdAndUpdate(jobId, {
                  processedItems: leads.length,
                  successCount: leads.length,
                  progress: Math.round((leads.length / maxResults) * 100),
                });
              }

              await new Promise((resolve) => setTimeout(resolve, 100));
            } catch (err) {
              console.error('Error processing lead:', err);
            }
          }
        }
      } else {
        throw new Error('Both Python scraper and Google Places API failed. Please configure GOOGLE_PLACES_API_KEY or install Python with Selenium.');
      }
    }

    // Mark job as completed
    await Job.findByIdAndUpdate(jobId, {
      status: 'completed',
      completedAt: new Date(),
      progress: 100,
      result: {
        leadsGenerated: leads.length,
        leadIds: leads.map((l) => l._id),
      },
    });
  } catch (err) {
    console.error('Job processing error:', err);
    await Job.findByIdAndUpdate(jobId, {
      status: 'failed',
      error: err instanceof Error ? err.message : 'Unknown error',
      completedAt: new Date(),
    });
  }
}

// GET: List all leads
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tag = searchParams.get('tag');

    const filter: any = { userId: payload.userId };
    if (status) filter.status = status;
    if (tag) filter.tags = tag;

    const leads = await Lead.find(filter).sort({ createdAt: -1 }).limit(100).lean();

    return NextResponse.json({ leads });
  } catch (err) {
    console.error('Error fetching leads', err);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}
