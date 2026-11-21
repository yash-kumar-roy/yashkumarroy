import mongoose from 'mongoose';

// Uploaded images / PDFs stored directly in MongoDB so they survive redeploys
// on hosts with ephemeral disks (Render, Railway, etc.). Max 4 MB each (Vercel rejects request bodies over 4.5 MB).
const mediaSchema = new mongoose.Schema(
  {
    filename: { type: String, default: '' },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

export const Media = mongoose.models.Media || mongoose.model('Media', mediaSchema);
export default Media;
