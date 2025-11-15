/**
 * Unsubscribe Model
 * Maintains a suppression list of unsubscribed email addresses
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUnsubscribe extends Document {
  email: string;
  campaignId?: string;
  reason?: string;
  createdAt: Date;
}

const UnsubscribeSchema = new Schema<IUnsubscribe>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    campaignId: {
      type: String,
    },
    reason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookups
UnsubscribeSchema.index({ email: 1 });

const Unsubscribe: Model<IUnsubscribe> =
  mongoose.models.Unsubscribe || mongoose.model<IUnsubscribe>('Unsubscribe', UnsubscribeSchema);

export default Unsubscribe;
