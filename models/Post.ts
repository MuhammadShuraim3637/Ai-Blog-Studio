import mongoose, { Schema, Document, Model, models, model } from "mongoose";
import { IUser } from "./User";

export interface IPost extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  author: mongoose.Types.ObjectId | IUser;
  status: 'draft' | 'published' | 'archived' | 'scheduled';
  scheduleDate?: Date;
  categories: string[];
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  views: number;
  likes: number;
  likesBy: mongoose.Types.ObjectId[];
  shares: number;
  readingTime: number;
  aiGenerated: boolean;
  aiPrompt?: string;
  aiModel?: string;
  aiSettings?: {
    temperature: number;
    maxTokens: number;
    creativity: number;
  };
  wordCount: number;
  isFeatured: boolean;
  publishedAt?: Date;
  lastEditedBy?: mongoose.Types.ObjectId | IUser;
  version: number;
  previousVersions?: {
    content: string;
    version: number;
    updatedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    excerpt: {
      type: String,
      maxlength: [300, "Excerpt cannot exceed 300 characters"],
    },
    featuredImage: {
      type: String,
      default: null,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived', 'scheduled'],
      default: 'draft',
      index: true,
    },
    scheduleDate: {
      type: Date,
      validate: {
        validator: function(this: IPost, value: Date) {
          return this.status !== 'scheduled' || !!value;
        },
        message: "Schedule date is required for scheduled posts",
      },
    },
    categories: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    seoTitle: {
      type: String,
      maxlength: [60, "SEO title should not exceed 60 characters"],
    },
    seoDescription: {
      type: String,
      maxlength: [160, "SEO description should not exceed 160 characters"],
    },
    seoKeywords: [String],
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likesBy: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    shares: {
      type: Number,
      default: 0,
    },
    readingTime: {
      type: Number,
      default: 0,
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    aiPrompt: String,
    aiModel: String,
    aiSettings: {
      temperature: {
        type: Number,
        min: 0,
        max: 2,
      },
      maxTokens: Number,
      creativity: {
        type: Number,
        min: 0,
        max: 1,
      },
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: Date,
    lastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    version: {
      type: Number,
      default: 1,
    },
    previousVersions: [{
      content: String,
      version: Number,
      updatedAt: Date,
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes
PostSchema.index({ author: 1, status: 1 });
PostSchema.index({ status: 1, publishedAt: -1 });
PostSchema.index({ categories: 1, status: 1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ views: -1 });
PostSchema.index({ likes: -1 });
PostSchema.index({ isFeatured: 1, publishedAt: -1 });

// 🚀 FIX 1: Pre-save slug generator (Removed next() and transformed into async resolution)
PostSchema.pre('save', async function(this: IPost) {
  if (this.isModified('title') && !this.slug) {
    let slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    let uniqueSlug = slug;
    let counter = 1;
    while (await mongoose.models.Post?.findOne({ slug: uniqueSlug, _id: { $ne: this._id } })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    this.slug = uniqueSlug;
  }
});

// 🚀 FIX 2: Pre-save stats calculator (Removed next callback mapping)
PostSchema.pre('save', function(this: IPost) {
  if (this.isModified('content')) {
    this.wordCount = this.content.trim().split(/\s+/).length;
    this.readingTime = Math.ceil(this.wordCount / 200);
    
    if (!this.excerpt && this.content) {
      this.excerpt = this.content
        .replace(/<[^>]*>/g, '')
        .substring(0, 300)
        .trim();
      if (this.excerpt.length === 300) this.excerpt += '...';
    }
  }
  
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

// 🚀 FIX 3: Pre-save version controller (Removed next wrapper validation)
PostSchema.pre('save', async function(this: IPost) {
  if (this.isModified('content') && !this.isNew) {
    const previousVersion = {
      content: this.get('content'),
      version: this.version,
      updatedAt: this.updatedAt || new Date(),
    };
    
    this.previousVersions = [
      previousVersion,
      ...(this.previousVersions || []),
    ].slice(0, 10);
    
    this.version += 1;
  }
});

// Instance methods
PostSchema.methods.incrementViews = async function(): Promise<void> {
  this.views += 1;
  await this.save();
};

PostSchema.methods.toggleLike = async function(userId: mongoose.Types.ObjectId): Promise<boolean> {
  const userLikedIndex = this.likesBy.indexOf(userId);
  if (userLikedIndex === -1) {
    this.likesBy.push(userId);
    this.likes += 1;
    await this.save();
    return true;
  } else {
    this.likesBy.splice(userLikedIndex, 1);
    this.likes -= 1;
    await this.save();
    return false;
  }
};

PostSchema.methods.incrementShares = async function(): Promise<void> {
  this.shares += 1;
  await this.save();
};

// Statics
PostSchema.statics.findPublished = function() {
  return this.find({ status: 'published', publishedAt: { $lte: new Date() } });
};

PostSchema.statics.findByAuthor = function(authorId: mongoose.Types.ObjectId) {
  return this.find({ author: authorId }).sort({ createdAt: -1 });
};

PostSchema.statics.getPopularPosts = function(limit: number = 10) {
  return this.find({ status: 'published' })
    .sort({ views: -1, likes: -1 })
    .limit(limit);
};

// Virtuals
PostSchema.virtual('likeCount').get(function() { return this.likes; });
PostSchema.virtual('viewCount').get(function() { return this.views; });

const Post = (models.Post as Model<IPost>) || model<IPost>('Post', PostSchema);
export default Post;