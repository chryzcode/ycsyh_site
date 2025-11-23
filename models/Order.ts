import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  beatId: mongoose.Types.ObjectId;
  customerEmail: string;
  customerName: string;
  stripeSessionId: string;
  stripePaymentIntentId: string;
  amount: number;
  licenseType: 'MP3 Lease' | 'WAV Lease' | 'Trackout Lease' | 'Exclusive';
  licensePdfUrl: string;
  status: 'pending' | 'completed' | 'failed';
  filesDelivered: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    beatId: {
      type: Schema.Types.ObjectId,
      ref: 'Beat',
      required: true,
    },
    customerEmail: {
      type: String,
      required: [true, 'Customer email is required'],
      lowercase: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    stripeSessionId: {
      type: String,
      required: true,
      unique: true,
    },
    stripePaymentIntentId: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    licenseType: {
      type: String,
      enum: ['MP3 Lease', 'WAV Lease', 'Trackout Lease', 'Exclusive'],
      required: true,
    },
    licensePdfUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    filesDelivered: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
