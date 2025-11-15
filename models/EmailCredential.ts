/**
 * EmailCredential Model
 * Stores encrypted email credentials (e.g., Gmail app password) per user
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IEmailCredential extends Document {
  userId: mongoose.Types.ObjectId;
  provider: 'gmail' | 'smtp' | 'sendgrid';
  email: string;
  encryptedPassword: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmailCredentialSchema = new Schema<IEmailCredential>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['gmail', 'smtp', 'sendgrid'],
      required: true,
      default: 'gmail',
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    encryptedPassword: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

EmailCredentialSchema.index({ userId: 1, provider: 1 });

const EmailCredential: Model<IEmailCredential> =
  mongoose.models.EmailCredential || mongoose.model<IEmailCredential>('EmailCredential', EmailCredentialSchema);

export default EmailCredential;
