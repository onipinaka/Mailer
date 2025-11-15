/**
 * Workflow Model
 * Stores automation workflows (trigger -> actions)
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IWorkflow extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  active: boolean;
  trigger: {
    type: 'new_lead' | 'email_opened' | 'link_clicked' | 'schedule' | 'webhook';
    config: any; // trigger-specific configuration
  };
  actions: Array<{
    type: 'send_email' | 'send_sms' | 'send_whatsapp' | 'add_tag' | 'update_lead' | 'wait' | 'ai_analyze';
    config: any; // action-specific configuration
    delay?: number; // delay in minutes before executing
  }>;
  executionCount: number;
  lastExecuted?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WorkflowSchema = new Schema<IWorkflow>(
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
    active: {
      type: Boolean,
      default: true,
    },
    trigger: {
      type: {
        type: String,
        enum: ['new_lead', 'email_opened', 'link_clicked', 'schedule', 'webhook'],
        required: true,
      },
      config: {
        type: Schema.Types.Mixed,
        default: {},
      },
    },
    actions: [
      {
        type: {
          type: String,
          enum: ['send_email', 'send_sms', 'send_whatsapp', 'add_tag', 'update_lead', 'wait', 'ai_analyze'],
          required: true,
        },
        config: {
          type: Schema.Types.Mixed,
          default: {},
        },
        delay: {
          type: Number,
          default: 0,
        },
      },
    ],
    executionCount: {
      type: Number,
      default: 0,
    },
    lastExecuted: {
      type: Date,
    },
  },
  { timestamps: true }
);

WorkflowSchema.index({ userId: 1, active: 1 });

const Workflow: Model<IWorkflow> =
  mongoose.models.Workflow || mongoose.model<IWorkflow>('Workflow', WorkflowSchema);

export default Workflow;
