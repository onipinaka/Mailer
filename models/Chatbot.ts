import mongoose, { Document, Schema } from 'mongoose';

export interface IChatbot extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  platform: 'website' | 'whatsapp' | 'facebook' | 'instagram' | 'telegram';
  personality: {
    tone: 'professional' | 'friendly' | 'casual' | 'formal';
    language: string;
    greeting: string;
    fallbackMessage: string;
  };
  knowledgeBase?: string;
  flows: Array<{
    trigger: string;
    type: 'exact' | 'contains' | 'intent';
    response: string;
    actions?: Array<{
      type: 'send_email' | 'create_lead' | 'schedule_callback' | 'transfer_to_human';
      config: Record<string, any>;
    }>;
  }>;
  aiModel?: mongoose.Types.ObjectId;
  enableAI: boolean;
  conversations: number;
  satisfactionScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChatbotSchema = new Schema<IChatbot>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive',
    },
    platform: {
      type: String,
      enum: ['website', 'whatsapp', 'facebook', 'instagram', 'telegram'],
      required: true,
    },
    personality: {
      tone: {
        type: String,
        enum: ['professional', 'friendly', 'casual', 'formal'],
        default: 'friendly',
      },
      language: {
        type: String,
        default: 'en',
      },
      greeting: {
        type: String,
        default: 'Hello! How can I help you today?',
      },
      fallbackMessage: {
        type: String,
        default: "I'm not sure I understand. Could you rephrase that?",
      },
    },
    knowledgeBase: {
      type: String,
    },
    flows: [
      {
        trigger: { type: String, required: true },
        type: { type: String, enum: ['exact', 'contains', 'intent'], required: true },
        response: { type: String, required: true },
        actions: [
          {
            type: {
              type: String,
              enum: ['send_email', 'create_lead', 'schedule_callback', 'transfer_to_human'],
            },
            config: Schema.Types.Mixed,
          },
        ],
      },
    ],
    aiModel: {
      type: Schema.Types.ObjectId,
      ref: 'AIModel',
    },
    enableAI: {
      type: Boolean,
      default: false,
    },
    conversations: {
      type: Number,
      default: 0,
    },
    satisfactionScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

ChatbotSchema.index({ userId: 1, status: 1 });
ChatbotSchema.index({ userId: 1, platform: 1 });

export default mongoose.models.Chatbot || mongoose.model<IChatbot>('Chatbot', ChatbotSchema);
