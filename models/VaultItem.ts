// models/VaultItem.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the interface for the VaultItem document
export interface IVaultItem extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  title: string;
  username: string;
  password: string; // This will store the encrypted password
  url: string;
  notes: string;
}

const VaultItemSchema: Schema<IVaultItem> = new mongoose.Schema({
  // Link to the User model
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String, // This will store the encrypted string
    required: true,
  },
  url: String,
  notes: String,
});

// To prevent Mongoose from redefining the model, we check if it already exists
const VaultItem: Model<IVaultItem> = mongoose.models.VaultItem || mongoose.model<IVaultItem>('VaultItem', VaultItemSchema);

export default VaultItem;