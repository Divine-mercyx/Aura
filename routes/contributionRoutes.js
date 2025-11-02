import Contribution from "../models/Contribution.js";
import Community from "../models/Community.js";

/**
 * Create a new contribution
 */
export const createContribution = async (req, res) => {
    try {
        const { communityId, contributor, amount, purpose, txDigest } = req.body;

        if (!communityId || !contributor || !amount || !purpose || !txDigest) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const community = await Community.findById(communityId);
        if (!community) {
            return res.status(404).json({ error: "Community not found" });
        }

        const contribution = await Contribution.create({
            community: communityId,
            contributor,
            amount,
            purpose,
            txDigest,
        });

        const prev = BigInt(community.funds.totalRaised || "0");
        const newTotal = prev + BigInt(amount);

        const fundLimit = BigInt(community.funds.fundLimit || "0");
        if (fundLimit > 0n && newTotal > fundLimit) {
            return res.status(400).json({ error: "Funding limit reached or exceeded" });
        }

        community.funds.totalRaised = newTotal.toString();
        await community.save();

        res.status(201).json({ success: true, contribution, community });
    } catch (err) {
        console.error("Error creating contribution:", err);
        res.status(500).json({ error: "Server error" });
    }
};

/**
 * Fetch all contributions for a specific community
 */
export const getContributionsByCommunity = async (req, res) => {
    try {
        const contributions = await Contribution.find({ community: req.params.communityId })
            .populate("contributor", "username")
            .sort({ createdAt: -1 });

        res.json({ success: true, contributions });
    } catch (err) {
        console.error("Error fetching community contributions:", err);
        res.status(500).json({ error: "Server error" });
    }
};

/**
 * Fetch a single contribution by ID
 */
export const getContributionById = async (req, res) => {
    try {
        const contribution = await Contribution.findById(req.params.id)
            .populate("contributor", "username")
            .populate("community", "name");

        if (!contribution) {
            return res.status(404).json({ error: "Contribution not found" });
        }

        res.json({ success: true, contribution });
    } catch (err) {
        console.error("Error fetching contribution:", err);
        res.status(500).json({ error: "Server error" });
    }
};

/**
 * Fetch all contributions (optionally filtered by contributor)
 */
export const getAllContributions = async (req, res) => {
    try {
        const { contributor } = req.query;
        const filter = contributor ? { contributor } : {};

        const contributions = await Contribution.find(filter)
            .populate("contributor", "username")
            .populate("community", "name")
            .sort({ createdAt: -1 });

        res.json({ success: true, contributions });
    } catch (err) {
        console.error("Error fetching contributions:", err);
        res.status(500).json({ error: "Server error" });
    }
};
