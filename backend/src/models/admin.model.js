import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    fullName: {
      type: String,
      default: 'Admin',
      trim: true
    },
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLoginAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

export const Admin = mongoose.model('Admin', adminSchema);
