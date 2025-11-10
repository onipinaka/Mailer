/**
 * EmailEvent Model
 * Stores campaign analytics: sent, delivered, opened, bounced
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IEmailEvent extends Document {
  userId: mongoose.Types.ObjectId;
  campaignId: string;
  subject: string;
  sent: number;
  delivered: number;
  opened: number;
  bounced: number;
  failed: number;
  recipients: number;
  sendMethod: 'gmail' | 'smtp' | 'sendgrid';
  createdAt: Date;
  updatedAt: Date;
}

const EmailEventSchema = new Schema<IEmailEvent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    campaignId: {
      type: String,
      required: true,
      unique: true,
    },
    subject: {
      type: String,
      required: true,
    },
    sent: {
      type: Number,
      default: 0,
    },
    delivered: {
      type: Number,
      default: 0,
    },
    opened: {
      type: Number,
      default: 0,
    },
    bounced: {
      type: Number,
      default: 0,
    },
    failed: {
      type: Number,
      default: 0,
    },
    recipients: {
      type: Number,
      required: true,
    },
    sendMethod: {
      type: String,
      enum: ['gmail', 'smtp', 'sendgrid'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries (campaignId index already created by unique: true)
EmailEventSchema.index({ userId: 1, createdAt: -1 });

const EmailEvent: Model<IEmailEvent> =
  mongoose.models.EmailEvent || mongoose.model<IEmailEvent>('EmailEvent', EmailEventSchema);

export default EmailEvent;
