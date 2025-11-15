/**
 * Integration Model
 * Stores external platform integrations (Meta Ads, Google Analytics, etc.)
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IIntegration extends Document {
  userId: mongoose.Types.ObjectId;
  platform: 'meta_ads' | 'google_ads' | 'google_analytics' | 'mailchimp' | 'hubspot' | 'salesforce' | 'custom';
  label?: string;
  active: boolean;
  encryptedCredentials: string; // OAuth tokens or API keys
  config?: any; // platform-specific settings
  lastSync?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationSchema = new Schema<IIntegration>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    platform: {
      type: String,
      enum: ['meta_ads', 'google_ads', 'google_analytics', 'mailchimp', 'hubspot', 'salesforce', 'custom'],
      required: true,
    },
    label: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    encryptedCredentials: {
      type: String,
      required: true,
    },
    config: {
      type: Schema.Types.Mixed,
    },
    lastSync: {
      type: Date,
    },
  },
  { timestamps: true }
);

IntegrationSchema.index({ userId: 1, platform: 1 });

const Integration: Model<IIntegration> =
  mongoose.models.Integration || mongoose.model<IIntegration>('Integration', IntegrationSchema);

export default Integration;
