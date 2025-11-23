import mongoose, { Schema, Document } from 'mongoose';

export interface IBeat extends Document {
  title: string;
  producer: string;
  category: string;
  bpm: number;
  key: string;
  mp3Price: number;
  wavPrice: number;
  trackoutPrice: number;
  exclusivePrice?: number;
  description?: string;
  imageUrl?: string;
  previewUrl?: string;
  mp3Url: string;
  wavUrl?: string;
  trackoutsUrl?: string;
  isSold: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BeatSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    producer: {
      type: String,
      required: [true, 'Producer name is required'],
      default: 'Heard Music',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Drill', 'UK Rap', 'Jersey Club', 'Cinematic', 'Trap', 'R&B', 'Hip-Hop', 'Other'],
    },
    bpm: {
      type: Number,
      required: [true, 'BPM is required'],
      min: 60,
      max: 200,
    },
    key: {
      type: String,
      required: [true, 'Key is required'],
    },
    mp3Price: {
      type: Number,
      required: [true, 'MP3 price is required'],
      default: 45,
      min: 0,
    },
    wavPrice: {
      type: Number,
      required: [true, 'WAV price is required'],
      default: 60,
      min: 0,
    },
    trackoutPrice: {
      type: Number,
      required: [true, 'Trackout price is required'],
      default: 300,
      min: 0,
    },
    exclusivePrice: {
      type: Number,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
    },
    previewUrl: {
      type: String,
    },
    mp3Url: {
      type: String,
      required: [true, 'MP3 URL is required'],
    },
    wavUrl: {
      type: String,
    },
    trackoutsUrl: {
      type: String,
    },
    isSold: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Beat || mongoose.model<IBeat>('Beat', BeatSchema);
