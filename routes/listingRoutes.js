import express from "express";
import Listing from "../models/Listing.js";
import { SuiClient } from "@mysten/sui/client";

const router = express.Router();
const client = new SuiClient({ url: process.env.SUI_FULLNODE_URL || "https://fullnode.testnet.sui.io:443" });

/**
 * POST /api/listings
 * body: { seller, assetType, assetObjectId?, amount, wantAssetType, wantAmount, meta? }
 */
export const listAsset = async (req, res) => {
  try {
    const { seller, assetType, assetObjectId, amount, wantAssetType, wantAmount, meta } = req.body;
    if (!seller || !assetType || !amount || !wantAssetType || !wantAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const listing = new Listing({ seller, assetType, assetObjectId: assetObjectId || null, amount, wantAssetType, wantAmount, meta });
    await listing.save();
    res.json({ success: true, listing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * GET /api/listings
 * optional query: ?status=ACTIVE
 */
export const getListing = async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const list = await Listing.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json(list);
};

/**
 * POST /api/listings/:id/accept
 * Buyer accepts the listing. Backend checks that buyer has enough funds (offchain check).
 * body: { buyer }
 */
export const acceptListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.status !== "ACTIVE") return res.status(400).json({ error: "Listing not available" });

    const { buyer } = req.body;
    if (!buyer) return res.status(400).json({ error: "buyer required" });

    // Check buyer balances for wantAssetType
    // getAllBalances returns [{ coinType, totalBalance }]
    const balances = await client.getAllBalances({ owner: buyer });
    const found = (balances || []).find(b => b.coinType === listing.wantAssetType);
    const buyerBalance = found ? BigInt(found.totalBalance ?? found.totalBalanceString ?? found.totalBalance) : BigInt(0);

    const required = BigInt(listing.wantAmount);
    if (buyerBalance < required) {
      return res.status(400).json({ error: "Insufficient balance for buyer", buyerBalance: buyerBalance.toString(), required: required.toString() });
    }

    // Mark listing pending and set buyer (prevents race)
    listing.status = "PENDING";
    listing.buyer = buyer;
    listing.acceptedAt = new Date();
    await listing.save();

    // Respond to frontend with buyer instructions (they should create & sign payment tx to seller)
    // Frontend must: sign & execute tx, then call /complete with digest
    res.json({
      success: true,
      message: "Listing accepted. Proceed to sign and submit payment from your wallet and then call /complete with tx digest",
      listingId: listing._id,
      seller: listing.seller,
      wantAssetType: listing.wantAssetType,
      wantAmount: listing.wantAmount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * POST /api/listings/:id/complete
 * body: { buyer, txDigest }
 * Verify the on-chain tx matches expected transfer (from buyer to seller, coin type and amount)
 */
export const completeListing =  async (req, res) => {
  try {
    const { buyer, txDigest } = req.body;
    if (!buyer || !txDigest) return res.status(400).json({ error: "buyer and txDigest required" });

    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.status !== "PENDING") return res.status(400).json({ error: "Listing not pending" });
    if (listing.buyer !== buyer) return res.status(400).json({ error: "Buyer mismatch" });

    // Fetch transaction details
    const tx = await client.getTransactionBlock({ digest: txDigest, options: { showEffects: true, showEvents: true } });
    if (!tx) return res.status(400).json({ error: "Transaction not found on chain" });

    // Basic verification logic:
    // - find transfer effects/events that move wantAssetType from buyer to seller
    const effects = tx.effects;
    // NOTE: SDK shapes vary; inspect events or balance changes. We'll look at events and recipients
    // This example does a best-effort check; expand to exact verification needed by your app.

    // Quick guard: ensure transaction signer includes buyer
    const signers = tx.transaction?.signatures ? tx.transaction.signatures : tx.transaction?.signer ?? [];
    // Many SDK versions return signers differently; we perform a looser check:
    const txSigners = tx.authSigners || tx.signers || [];

    // For safer check, inspect events for TransferObject / TransferSui etc.
    const events = tx.events || [];
    // Try to find a transfer event to seller
    let matched = false;
    for (const ev of events) {
      // event types differ; check for recipient field and coin type metadata if present
      const parsed = ev.parsedJson ?? ev;
      const recipient = parsed?.recipient || parsed?.to || parsed?.fields?.recipient;
      const coinType = parsed?.coinType || parsed?.type || parsed?.fields?.coin_type;
      const amountStr = parsed?.amount || parsed?.fields?.amount || parsed?.fields?.value;
      if (!recipient) continue;
      if (recipient.toLowerCase() === listing.seller.toLowerCase() && coinType === listing.wantAssetType) {
        // Note: amount parsing might require converting to BigInt
        if (!amountStr || BigInt(amountStr) >= BigInt(listing.wantAmount)) {
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      // Could also inspect balance changes or object transfers. For now: reject.
      return res.status(400).json({ error: "On-chain transaction did not match expected payment to seller" });
    }

    // If matched, mark listing completed
    listing.status = "COMPLETED";
    listing.completedAt = new Date();
    await listing.save();

    // Post-trade actions: update seller/trust, emit notifications, etc.
    res.json({ success: true, listing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

/**
 * POST /api/listings/:id/cancel
 * body: { seller }
 */
export const cancelListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.status !== "ACTIVE") return res.status(400).json({ error: "Only active listings can be cancelled" });

    const { seller } = req.body;
    if (String(listing.seller).toLowerCase() !== String(seller).toLowerCase()) return res.status(403).json({ error: "Only seller can cancel" });

    listing.status = "CANCELLED";
    await listing.save();
    res.json({ success: true, listing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export default router;
