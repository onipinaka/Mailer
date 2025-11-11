/**
 * AIModel Model
 * Stores AI model API credentials (OpenAI, Claude, etc.) per user
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAIModel extends Document {
  userId: mongoose.Types.ObjectId;
  provider: 'openai' | 'anthropic' | 'google' | 'custom';
  label?: string;
  model?: string; // e.g., 'gpt-4', 'claude-3-opus'
  encryptedApiKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const AIModelSchema = new Schema<IAIModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['openai', 'anthropic', 'google', 'custom'],
      required: true,
      default: 'openai',
    },
    label: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    encryptedApiKey: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

AIModelSchema.index({ userId: 1, provider: 1 });

const AIModel: Model<IAIModel> =
  mongoose.models.AIModel || mongoose.model<IAIModel>('AIModel', AIModelSchema);

export default AIModel;
