/**
 * SMSCredential Model
 * Stores encrypted SMS provider credentials (e.g., Twilio) per user
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISMSCredential extends Document {
  userId: mongoose.Types.ObjectId;
  provider: 'twilio' | 'nexmo' | 'other';
  label?: string;
  fromNumber: string;
  encryptedConfig: string; // encrypted JSON with auth tokens / keys
  createdAt: Date;
  updatedAt: Date;
}

const SMSCredentialSchema = new Schema<ISMSCredential>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['twilio', 'nexmo', 'other'],
      required: true,
      default: 'twilio',
    },
    label: {
      type: String,
      trim: true,
    },
    fromNumber: {
      type: String,
      required: true,
      trim: true,
    },
    encryptedConfig: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

SMSCredentialSchema.index({ userId: 1, provider: 1 });

const SMSCredential: Model<ISMSCredential> =
  mongoose.models.SMSCredential || mongoose.model<ISMSCredential>('SMSCredential', SMSCredentialSchema);

export default SMSCredential;
