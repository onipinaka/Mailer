import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import Lead from '@/models/Lead';
import mongoose from 'mongoose';

/**
 * Lead Generation via Google Places API
 * Legal alternative to scraping Google Maps
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { query, location, tags = [] } = body || {};

    if (!query) {
      return NextResponse.json({ error: 'query is required (e.g., "restaurants in Pune")' }, { status: 400 });
    }

    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!googleApiKey) {
      return NextResponse.json({ 
        error: 'Google Places API not configured. Add GOOGLE_PLACES_API_KEY to environment.' 
      }, { status: 400 });
    }

    // Google Places Text Search API
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${googleApiKey}`;
    
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (searchData.status !== 'OK') {
      return NextResponse.json({ 
        error: `Google Places API error: ${searchData.status}`,
        details: searchData.error_message 
      }, { status: 400 });
    }

    const leads = [];

    // Process each place
    for (const place of searchData.results.slice(0, 20)) { // Limit to 20 results
      // Get place details
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,url&key=${googleApiKey}`;
      
      const detailsRes = await fetch(detailsUrl);
      const detailsData = await detailsRes.json();

      if (detailsData.status === 'OK') {
        const placeDetails = detailsData.result;

        // Create lead
        const lead = new Lead({
          userId: new mongoose.Types.ObjectId(payload.userId),
          businessName: placeDetails.name,
          category: place.types?.[0] || 'business',
          address: placeDetails.formatted_address,
          website: placeDetails.website,
          phone: placeDetails.formatted_phone_number,
          googleMapsUrl: placeDetails.url,
          rating: placeDetails.rating,
          reviewsCount: placeDetails.user_ratings_total || 0,
          tags: [...tags, query.split(' ')[0]], // Add query keyword as tag
          status: 'new',
        });

        await lead.save();
        leads.push(lead);
      }

      // Respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return NextResponse.json({ 
      success: true, 
      count: leads.length,
      leads: leads.map(l => ({
        id: l._id,
        businessName: l.businessName,
        category: l.category,
        phone: l.phone,
        website: l.website,
        rating: l.rating,
      })),
    });
  } catch (err) {
    console.error('Error generating leads', err);
    return NextResponse.json({ error: 'Failed to generate leads' }, { status: 500 });
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
