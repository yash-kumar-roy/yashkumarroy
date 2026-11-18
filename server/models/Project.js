import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      default: '',
    },
    stack: {
      type: [String],
      default: [],
    },
    liveUrl: {
      type: String,
      default: '',
    },
    githubUrl: {
      type: String,
      default: '',
    },
    demoType: {
      type: String,
      enum: ['external', 'interactive', 'code'],
      default: 'interactive',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    icon: {
      type: String,
      default: '💻',
    },
    highlights: {
      type: [String],
      default: [],
    },
    // Image URLs (uploaded via /api/media or external). The first one is used as the cover.
    images: {
      type: [String],
      default: [],
    },
    year: {
      type: String,
      default: '',
      trim: true,
    },
    // One-line headline result shown on the card, e.g. "ROC-AUC 0.89 on holdout data".
    result: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Fallback to existing model if already compiled
export const Project =
  mongoose.models.Project || mongoose.model('Project', projectSchema);

export default Project;
