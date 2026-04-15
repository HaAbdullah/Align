const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema(
  {
    firebase_uid: { type: String, required: true, index: true },
    document_type: { type: String, enum: ['resume', 'cover_letter'] },
    html_content: String,
    pdf_content: String,
    content_format: { type: String, default: 'html' },
    favorited: { type: Boolean, default: false },
    favorited_at: Date,
  },
  {
    timestamps: true,
  }
);

DocumentSchema.index({ firebase_uid: 1, createdAt: -1 });
DocumentSchema.index({ firebase_uid: 1, favorited_at: -1 });

module.exports = mongoose.model('Document', DocumentSchema);
