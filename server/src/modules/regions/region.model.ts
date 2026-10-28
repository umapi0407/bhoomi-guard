import mongoose, { Schema, Document } from 'mongoose';

export interface IRegion extends Document {
  code: string;
  name: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  slopeAngleAvg: number;
  geologySusceptibility: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  criticalRainfallThreshold24h: number;
  highRainfallThreshold24h: number;
  emergencyPhone: string;
  currentRiskLevel: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  lastRainfall24h: number;
  lastAssessedAt: Date;
}

const RegionSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    name: { type: String, required: true },
    state: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    slopeAngleAvg: { type: Number, required: true, default: 25 },
    geologySusceptibility: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH', 'VERY_HIGH'],
      default: 'HIGH',
    },
    criticalRainfallThreshold24h: { type: Number, required: true, default: 70 },
    highRainfallThreshold24h: { type: Number, required: true, default: 110 },
    emergencyPhone: { type: String, default: '112' },
    currentRiskLevel: {
      type: String,
      enum: ['GREEN', 'YELLOW', 'ORANGE', 'RED'],
      default: 'GREEN',
    },
    lastRainfall24h: { type: Number, default: 0 },
    lastAssessedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const RegionModel = mongoose.models.Region || mongoose.model<IRegion>('Region', RegionSchema);
