import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema(
  {
    role: { type: String, trim: true, default: '' },
    org: { type: String, trim: true, default: '' },
    start: { type: String, trim: true, default: '' },
    end: { type: String, trim: true, default: '' },
    summary: { type: String, default: '' },
    bullets: { type: [String], default: [] },
    tags: { type: [String], default: [] },
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    degree: { type: String, trim: true, default: '' },
    org: { type: String, trim: true, default: '' },
    start: { type: String, trim: true, default: '' },
    end: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const skillGroupSchema = new mongoose.Schema(
  {
    group: { type: String, trim: true, default: '' },
    items: { type: [String], default: [] },
  },
  { _id: false }
);

// Single-document collection holding everything editable about the site owner.
const profileSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true },
    name: { type: String, trim: true, default: '' },
    role: { type: String, trim: true, default: '' },
    tagline: { type: String, trim: true, default: '' },
    about: { type: [String], default: [] },
    location: { type: String, trim: true, default: '' },
    availability: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' },
    avatar: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    socials: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      kaggle: { type: String, default: '' },
      instagram: { type: String, default: '' },
    },
    heroMetric: {
      value: { type: Number, default: 0.89 },
      label: { type: String, default: '' },
      projectSlug: { type: String, default: '' },
    },
    experience: { type: [experienceSchema], default: [] },
    education: { type: [educationSchema], default: [] },
    skills: { type: [skillGroupSchema], default: [] },
  },
  { timestamps: true }
);

export const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);
export default Profile;
