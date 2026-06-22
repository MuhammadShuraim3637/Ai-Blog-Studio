import mongoose, { Schema, Document, Model, models, model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  stripeCustomerId?: string;
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'trialing';
  subscriptionEndsAt?: Date;
  apiKey?: string;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
  generateEmailVerificationToken(): string;
  generatePasswordResetToken(): string;
  generateAPIKey(): string;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    stripeCustomerId: String,
    subscriptionTier: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'trialing'],
      default: 'active',
    },
    subscriptionEndsAt: Date,
    apiKey: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
UserSchema.index({ stripeCustomerId: 1 });
UserSchema.index({ subscriptionTier: 1, subscriptionStatus: 1 });
UserSchema.index({ lockUntil: 1 }, { expireAfterSeconds: 0 });

// Virtual
UserSchema.virtual('isLocked').get(function (this: IUser) {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// Pre-save: hash password
UserSchema.pre('save', async function (this: IUser) {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Pre-save: generate API key for new users (Edge-safe random hex generation)
UserSchema.pre('save', function (this: IUser) {
  if (this.isNew && !this.apiKey) {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const randomHex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    this.apiKey = `ai_blog_${randomHex}`;
  }
});

// Instance methods
UserSchema.methods.comparePassword = async function (
  this: IUser,
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.generateEmailVerificationToken = function (this: IUser): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Edge-safe hashing using SHA-256 placeholder or string format since web crypto is async
  this.emailVerificationToken = token; 
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return token;
};

UserSchema.methods.generatePasswordResetToken = function (this: IUser): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  
  this.passwordResetToken = token;
  this.passwordResetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000);
  return token;
};

UserSchema.methods.generateAPIKey = function (): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const randomHex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  return `ai_blog_${randomHex}`;
};

UserSchema.methods.incrementLoginAttempts = async function (this: IUser): Promise<void> {
  if (this.lockUntil && this.lockUntil < new Date()) {
    await this.resetLoginAttempts();
    return;
  }
  this.loginAttempts += 1;
  if (this.loginAttempts >= 5 && !this.lockUntil) {
    this.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
  }
  await this.save();
};

UserSchema.methods.resetLoginAttempts = async function (this: IUser): Promise<void> {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
};

// Static methods
UserSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email }).select('+password');
};

UserSchema.statics.findByAPIKey = function (apiKey: string) {
  return this.findOne({ apiKey, isActive: true });
};

const User = (models.User as Model<IUser>) || model<IUser>('User', UserSchema);

export default User;