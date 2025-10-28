import mongoose from "mongoose";

const ListingSchema = new mongoose.Schema({
  seller: { type: String, required: true }, 
  assetType: { type: String, required: true },
  assetObjectId: { type: String, default: null }, 
  amount: { type: String, required: true },
  wantAssetType: { type: String, required: true },
  wantAmount: { type: String, required: true },   
  status: { type: String, enum: ["ACTIVE","PENDING","COMPLETED","CANCELLED"], default: "ACTIVE" },
  createdAt: { type: Date, default: Date.now },
  buyer: { type: String, default: null },
  acceptedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  meta: { type: Object, default: {} } 
});

export default mongoose.model("Listing", ListingSchema);
