import mongoose, { Schema, Document } from 'mongoose';

export interface IIncident extends Document {
  incidentId: string;
  type: 'LANDSLIDE' | 'ROAD_BLOCKAGE' | 'FLASH_FLOOD' | 'DEBRIS_FLOW' | 'CRACKED_SLOPE';
  title: string;
  description: string;
  regionCode: string;
  locationName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'REPORTED' | 'VERIFIED' | 'REJECTED' | 'RESOLVED';
  reportedBy: {
    name: string;
    phone?: string;
    role: string;
  };
  verifiedBy?: string;
  photoUrl?: string;
  isOfflineSynced: boolean;
  notes?: string;
}

const IncidentSchema: Schema = new Schema(
  {
    incidentId: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: ['LANDSLIDE', 'ROAD_BLOCKAGE', 'FLASH_FLOOD', 'DEBRIS_FLOW', 'CRACKED_SLOPE'],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    regionCode: { type: String, required: true, index: true },
    locationName: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['REPORTED', 'VERIFIED', 'REJECTED', 'RESOLVED'],
      default: 'REPORTED',
      index: true,
    },
    reportedBy: {
      name: { type: String, default: 'Citizen Reporter' },
      phone: { type: String },
      role: { type: String, default: 'CITIZEN' },
    },
    verifiedBy: { type: String },
    photoUrl: { type: String },
    isOfflineSynced: { type: Boolean, default: false },
    notes: { type: String },
  },
  { timestamps: true }
);

export const IncidentModel =
  mongoose.models.Incident || mongoose.model<IIncident>('Incident', IncidentSchema);
