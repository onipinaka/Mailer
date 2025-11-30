import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import Lead from '@/models/Lead';
import Job from '@/models/Job';
import mongoose from 'mongoose';
import { ApifyClient } from 'apify-client';

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

    // Try using Apify Google Maps scraper (most reliable for production)
    try {
      const apifyToken = process.env.APIFY_API_TOKEN;
      
      if (apifyToken) {
        console.log('Using Apify Google Maps scraper');
        const client = new ApifyClient({ token: apifyToken });

        // Run the Google Maps scraper actor
        const run = await client.actor('compass/crawler-google-places').call({
          searchStringsArray: [query],
          maxCrawledPlacesPerSearch: maxResults,
          language: 'en',
          deeperCityScrape: false,
          skipClosedPlaces: false,
        });

        // Fetch results from dataset
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        for (const place of items) {
          const placeData = place as any;
          const lead = new Lead({
            userId: new mongoose.Types.ObjectId(userId),
            businessName: placeData.title || placeData.name || 'Unknown',
            category: placeData.categoryName || (Array.isArray(placeData.categories) ? placeData.categories[0] : undefined) || query.split(' ')[0],
            address: placeData.address || placeData.location?.address,
            website: placeData.website || placeData.url,
            phone: placeData.phone || placeData.phoneUnformatted,
            email: placeData.email,
            googleMapsUrl: placeData.url || `https://www.google.com/maps/place/?q=place_id:${placeData.placeId}`,
            rating: placeData.rating ? parseFloat(placeData.rating) : undefined,
            reviewsCount: placeData.reviewsCount || placeData.totalScore || 0,
            tags: [...tags, query.split(' ')[0]],
            status: 'new',
            notes: placeData.openingHours ? `Hours: ${JSON.stringify(placeData.openingHours)}` : undefined,
          });

          await lead.save();
          leads.push(lead);

          await Job.findByIdAndUpdate(jobId, {
            processedItems: leads.length,
            successCount: leads.length,
            progress: Math.round((leads.length / maxResults) * 100),
          });
        }

        console.log(`Apify scraper generated ${leads.length} leads`);
      } else {
        throw new Error('APIFY_API_TOKEN not configured');
      }

    } catch (apifyError) {
      console.error('Apify scraper failed:', apifyError);
      
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
        throw new Error('Both Apify and Google Places API failed. Please configure APIFY_API_TOKEN or GOOGLE_PLACES_API_KEY.');
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
