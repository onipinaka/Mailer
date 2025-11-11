/**
 * WhatsAppCredential Model
 * Stores encrypted WhatsApp Business API credentials per user
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IWhatsAppCredential extends Document {
  userId: mongoose.Types.ObjectId;
  provider: 'twilio' | 'whatsapp-business' | 'other';
  label?: string;
  phoneNumberId?: string;
  encryptedConfig: string; // encrypted JSON with auth tokens / keys
  createdAt: Date;
  updatedAt: Date;
}

const WhatsAppCredentialSchema = new Schema<IWhatsAppCredential>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['twilio', 'whatsapp-business', 'other'],
      required: true,
      default: 'twilio',
    },
    label: {
      type: String,
      trim: true,
    },
    phoneNumberId: {
      type: String,
      trim: true,
    },
    encryptedConfig: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

WhatsAppCredentialSchema.index({ userId: 1, provider: 1 });

const WhatsAppCredential: Model<IWhatsAppCredential> =
  mongoose.models.WhatsAppCredential || mongoose.model<IWhatsAppCredential>('WhatsAppCredential', WhatsAppCredentialSchema);

export default WhatsAppCredential;
