import mongoose, { Document, Schema } from 'mongoose';

export interface ISocialPost extends Document {
  userId: mongoose.Types.ObjectId;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok';
  content: string;
  mediaUrls?: string[];
  scheduledAt?: Date;
  postedAt?: Date;
  status: 'draft' | 'scheduled' | 'posted' | 'failed';
  platformPostId?: string;
  error?: string;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SocialPostSchema = new Schema<ISocialPost>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    platform: {
      type: String,
      enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    mediaUrls: [
      {
        type: String,
      },
    ],
    scheduledAt: {
      type: Date,
    },
    postedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'posted', 'failed'],
      default: 'draft',
    },
    platformPostId: {
      type: String,
    },
    error: {
      type: String,
    },
    engagement: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

SocialPostSchema.index({ userId: 1, status: 1 });
SocialPostSchema.index({ userId: 1, platform: 1 });
SocialPostSchema.index({ scheduledAt: 1 });

export default mongoose.models.SocialPost || mongoose.model<ISocialPost>('SocialPost', SocialPostSchema);
