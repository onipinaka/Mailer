import mongoose, { Document, Schema } from 'mongoose';

export interface IAdCampaign extends Document {
  userId: mongoose.Types.ObjectId;
  platform: 'meta_ads' | 'google_ads' | 'linkedin_ads' | 'tiktok_ads';
  name: string;
  objective: 'awareness' | 'traffic' | 'engagement' | 'leads' | 'sales' | 'conversions';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed';
  budget: {
    amount: number;
    currency: string;
    type: 'daily' | 'lifetime';
  };
  targeting: {
    locations?: string[];
    ageMin?: number;
    ageMax?: number;
    gender?: 'all' | 'male' | 'female';
    interests?: string[];
    customAudience?: string;
  };
  creative: {
    headline: string;
    description: string;
    imageUrl?: string;
    videoUrl?: string;
    callToAction: string;
    destinationUrl: string;
  };
  schedule: {
    startDate: Date;
    endDate?: Date;
  };
  platformCampaignId?: string;
  metrics?: {
    impressions: number;
    clicks: number;
    conversions: number;
    spent: number;
    ctr: number;
    cpc: number;
    cpa: number;
  };
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdCampaignSchema = new Schema<IAdCampaign>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    platform: {
      type: String,
      enum: ['meta_ads', 'google_ads', 'linkedin_ads', 'tiktok_ads'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    objective: {
      type: String,
      enum: ['awareness', 'traffic', 'engagement', 'leads', 'sales', 'conversions'],
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'completed', 'failed'],
      default: 'draft',
    },
    budget: {
      amount: { type: Number, required: true },
      currency: { type: String, default: 'USD' },
      type: { type: String, enum: ['daily', 'lifetime'], required: true },
    },
    targeting: {
      locations: [String],
      ageMin: Number,
      ageMax: Number,
      gender: { type: String, enum: ['all', 'male', 'female'], default: 'all' },
      interests: [String],
      customAudience: String,
    },
    creative: {
      headline: { type: String, required: true },
      description: { type: String, required: true },
      imageUrl: String,
      videoUrl: String,
      callToAction: { type: String, required: true },
      destinationUrl: { type: String, required: true },
    },
    schedule: {
      startDate: { type: Date, required: true },
      endDate: Date,
    },
    platformCampaignId: String,
    metrics: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      spent: { type: Number, default: 0 },
      ctr: { type: Number, default: 0 },
      cpc: { type: Number, default: 0 },
      cpa: { type: Number, default: 0 },
    },
    error: String,
  },
  {
    timestamps: true,
  }
);

AdCampaignSchema.index({ userId: 1, status: 1 });
AdCampaignSchema.index({ userId: 1, platform: 1 });

export default mongoose.models.AdCampaign || mongoose.model<IAdCampaign>('AdCampaign', AdCampaignSchema);
