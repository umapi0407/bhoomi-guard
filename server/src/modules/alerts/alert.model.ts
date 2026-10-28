import mongoose, { Schema, Document } from 'mongoose';

export interface IAlert extends Document {
  alertId: string;
  regionCode: string;
  regionName: string;
  severity: 'YELLOW' | 'ORANGE' | 'RED';
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'DISPATCHED' | 'RESOLVED' | 'CANCELLED';
  title: string;
  reason: string;
  rainfallRecorded: number;
  thresholdValue: number;
  recommendations: string[];
  approvedBy?: string;
  approvedAt?: Date;
  resolvedAt?: Date;
  isSimulated: boolean;
  whatsappBroadcastCount: number;
}

const AlertSchema: Schema = new Schema(
  {
    alertId: { type: String, required: true, unique: true, index: true },
    regionCode: { type: String, required: true, index: true },
    regionName: { type: String, required: true },
    severity: {
      type: String,
      enum: ['YELLOW', 'ORANGE', 'RED'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'DISPATCHED', 'RESOLVED', 'CANCELLED'],
      default: 'DRAFT',
      index: true,
    },
    title: { type: String, required: true },
    reason: { type: String, required: true },
    rainfallRecorded: { type: Number, required: true },
    thresholdValue: { type: Number, required: true },
    recommendations: [{ type: String }],
    approvedBy: { type: String },
    approvedAt: { type: Date },
    resolvedAt: { type: Date },
    isSimulated: { type: Boolean, default: false },
    whatsappBroadcastCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const AlertModel = mongoose.models.Alert || mongoose.model<IAlert>('Alert', AlertSchema);
