/**
 * Lead Model
 * Stores leads generated from Google Maps scraping or manual entry
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ILead extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  category?: string;
  address?: string;
  website?: string;
  phone?: string;
  email?: string;
  googleMapsUrl?: string;
  rating?: number;
  reviewsCount?: number;
  tags: string[];
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  leadScore?: number; // AI-generated score
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    googleMapsUrl: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
      default: 'new',
    },
    leadScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

LeadSchema.index({ userId: 1, status: 1 });
LeadSchema.index({ userId: 1, tags: 1 });
LeadSchema.index({ email: 1 });

const Lead: Model<ILead> =
  mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);

export default Lead;
