/**
 * RecipientStatus Model
 * Tracks individual email delivery status for each recipient
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IRecipientStatus extends Document {
  userId: mongoose.Types.ObjectId;
  campaignId: string;
  recipientEmail: string;
  recipientName?: string;
  status: 'sent' | 'delivered' | 'bounced' | 'failed' | 'opened';
  errorMessage?: string;
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RecipientStatusSchema = new Schema<IRecipientStatus>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    campaignId: {
      type: String,
      required: true,
      index: true,
    },
    recipientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    recipientName: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'bounced', 'failed', 'opened'],
      required: true,
      default: 'sent',
    },
    errorMessage: {
      type: String,
    },
    sentAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    deliveredAt: {
      type: Date,
    },
    openedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for faster queries
RecipientStatusSchema.index({ campaignId: 1, status: 1 });
RecipientStatusSchema.index({ userId: 1, createdAt: -1 });

const RecipientStatus: Model<IRecipientStatus> =
  mongoose.models.RecipientStatus || mongoose.model<IRecipientStatus>('RecipientStatus', RecipientStatusSchema);

export default RecipientStatus;
