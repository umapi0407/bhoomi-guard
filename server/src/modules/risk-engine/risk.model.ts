import mongoose, { Schema, Document } from 'mongoose';

export interface IRiskAssessment extends Document {
  regionCode: string;
  regionName: string;
  timestamp: Date;
  riskLevel: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  riskScore: number; // 0 - 100
  rainfall24h: number; // mm
  forecastRainfall24h: number; // mm
  slopeFactor: number;
  geologyFactor: number;
  contributingFactors: string[];
  isSimulated: boolean;
}

const RiskAssessmentSchema: Schema = new Schema(
  {
    regionCode: { type: String, required: true, index: true },
    regionName: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
    riskLevel: {
      type: String,
      enum: ['GREEN', 'YELLOW', 'ORANGE', 'RED'],
      required: true,
    },
    riskScore: { type: Number, required: true, min: 0, max: 100 },
    rainfall24h: { type: Number, required: true, default: 0 },
    forecastRainfall24h: { type: Number, default: 0 },
    slopeFactor: { type: Number, default: 1 },
    geologyFactor: { type: Number, default: 1 },
    contributingFactors: [{ type: String }],
    isSimulated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const RiskAssessmentModel =
  mongoose.models.RiskAssessment ||
  mongoose.model<IRiskAssessment>('RiskAssessment', RiskAssessmentSchema);
