import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'email_campaign' | 'sms_campaign' | 'whatsapp_campaign' | 'lead_generation' | 'social_post' | 'ad_campaign';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'paused';
  progress: number; // 0-100
  totalItems: number;
  processedItems: number;
  successCount: number;
  failedCount: number;
  data: any; // Job-specific configuration
  result?: any; // Job results
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['email_campaign', 'sms_campaign', 'whatsapp_campaign', 'lead_generation', 'social_post', 'ad_campaign'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'paused'],
      default: 'pending',
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
    processedItems: {
      type: Number,
      default: 0,
    },
    successCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    result: {
      type: Schema.Types.Mixed,
    },
    error: {
      type: String,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

JobSchema.index({ userId: 1, status: 1 });
JobSchema.index({ userId: 1, type: 1 });
JobSchema.index({ createdAt: -1 });

export default mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);
