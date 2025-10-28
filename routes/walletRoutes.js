import express from "express";
import { SuiClient } from "@mysten/sui/client";

const SUI_FULLNODE = process.env.SUI_FULLNODE_URL || "https://fullnode.testnet.sui.io:443";

const client = new SuiClient({ url: SUI_FULLNODE });

export const getAllAssets = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) return res.status(400).json({ error: "walletAddress is required" });

    const coinsResp = await client.getAllCoins({ owner: walletAddress });
    const coins = coinsResp.data ?? [];

    // 2) Get aggregated balances per coin type
    // The SDK exposes getAllBalances / getBalance via RPC helpers.
    // We'll call getAllBalances RPC using SuiClient method if available.
    let balances = [];
    try {
      const balancesResp = await client.getAllBalances({ owner: walletAddress });
      balances = balancesResp ?? [];
    } catch (e) {
      // If provider doesn't implement helper or error, fallback to aggregating coins locally:
      const map = {};
      coins.forEach((c) => {
        const coinType = c.coinType || c.type || (c.data?.type ?? "unknown");
        const bal = Number(c.balance ?? c.data?.fields?.balance ?? 0);
        map[coinType] = (map[coinType] || 0) + bal;
      });
      balances = Object.entries(map).map(([coinType, total]) => ({ coinType, totalBalance: String(total) }));
    }

    // 3) Get all owned objects (this returns paginated owned objects with content)
    const ownedResp = await client.getOwnedObjects({
      owner: walletAddress,
      // request content so we can inspect type and fields
      options: { showType: true, showDisplay: true, showContent: true },
      // optional: limit: 100
    });

    // Filter out coin objects to get NFTs / other objects
    const owned = ownedResp.data ?? [];
    const nftAssets = owned.filter((obj) => {
      const t = obj.data?.type || obj.type || "";
      // coin types typically include "::coin::Coin" or "0x2::sui::SUI"
      return !t.toLowerCase().includes("coin") && !t.includes("::coin::");
    });

    // Optionally format NFTs to expose friendly fields (name, url) if available
    const formattedNfts = nftAssets.map((obj) => {
      const id = obj.data?.objectId ?? obj.objectId ?? obj.reference?.objectId ?? null;
      const type = obj.data?.type ?? obj.type ?? "unknown";
      const display = obj.data?.display ?? obj.display ?? null;
      const contentFields = obj.data?.content?.fields ?? obj.data?.fields ?? null;
      return {
        objectId: id,
        type,
        display,
        contentFields,
        raw: obj,
      };
    });

    // Final response
    res.json({
      wallet: walletAddress,
      summary: {
        totalCoinObjects: coins.length,
        totalOwnedObjects: owned.length,
        totalNFTs: formattedNfts.length,
      },
      balances,         // aggregated balances per coin type (may be raw units)
      coins,            // raw coin objects array (paginated)
      nfts: formattedNfts, // filtered non-coin owned objects with basic fields
    });
  } catch (error) {
    console.error("Error fetching wallet assets:", error);
    res.status(500).json({ error: "Failed to fetch wallet assets", details: error.message });
  }
}