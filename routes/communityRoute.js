import Community from "../models/Community.js";
import Message from "../models/Message.js";

/**
 * POST /api/communities
 * body: { name, description, userId, cause, fundLimit }
 */
export const createCommunity = async (req, res) => {
    try {
        const { name, description, userId, cause, fundLimit } = req.body;
        if (!name || !cause || !userId) {
            return res.status(400).json({ error: "name, cause, and userId are required" });
        }

        const community = await Community.create({
            name,
            description,
            creator: userId,
            cause,
            members: [userId],
            funds: {
                fundLimit: fundLimit?.toString() || "0",
                totalRaised: "0",
                contributions: [],
            },
        });

        res.json({ success: true, community });
    } catch (error) {
        console.error("Error creating community:", error);
        res.status(500).json({ error: "Server error" });
    }
};

/**
 * POST /api/communities/:id/join
 * body: { userId }
 */
export const joinCommunity = async (req, res) => {
    try {
        const { userId } = req.body;
        const community = await Community.findById(req.params.id);
        if (!community) return res.status(404).json({ error: "Community not found" });

        if (!community.members.includes(userId)) {
            community.members.push(userId);
            await community.save();
        }

        res.json({ message: "Joined community", community });
    } catch (error) {
        console.error("Error joining community:", error);
        res.status(500).json({ error: "Server error" });
    }
};

/**
 * POST /api/communities/:id/leave
 * body: { userId }
 */
export const leaveCommunity = async (req, res) => {
    try {
        const { userId } = req.body;
        await Community.findByIdAndUpdate(req.params.id, { $pull: { members: userId } });
        res.json({ message: "Left community" });
    } catch (error) {
        console.error("Error leaving community:", error);
        res.status(500).json({ error: "Server error" });
    }
};

/**
 * GET /api/communities/:id/messages
 */
export const getCommunityMessages = async (req, res) => {
    try {
        const messages = await Message.find({ community: req.params.id })
            .populate("sender", "username");
        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Server error" });
    }
};

/**
 * GET /api/communities
 * optional query: ?search=...
 */
export const getCommunities = async (req, res) => {
    try {
        const { search } = req.query;
        const filter = search ? { name: { $regex: search, $options: "i" } } : {};

        const communities = await Community.find(filter)
            .populate("creator", "username")
            .select("name description creator cause members createdAt");

        res.json({ success: true, communities });
    } catch (err) {
        console.error("Error fetching communities:", err);
        res.status(500).json({ error: "Failed to fetch communities" });
    }
};

/**
 * GET /api/communities/:id
 */
export const getCommunityById = async (req, res) => {
    try {
        const community = await Community.findById(req.params.id)
            .populate("creator", "username")
            .populate("members", "username");

        if (!community) return res.status(404).json({ error: "Community not found" });

        res.json({ success: true, community });
    } catch (err) {
        console.error("Error fetching community:", err);
        res.status(500).json({ error: "Server error" });
    }
};

/**
 * POST /api/communities/:id/fund
 * body: { from, amount, txDigest }
 */
export const fundCommunity = async (req, res) => {
    try {
        const { from, amount, txDigest } = req.body;
        if (!from || !amount || !txDigest)
            return res.status(400).json({ error: "from, amount and txDigest required" });

        const community = await Community.findById(req.params.id);
        if (!community) return res.status(404).json({ error: "Community not found" });

        const prev = BigInt(community.funds.totalRaised || "0");
        const newTotal = prev + BigInt(amount);
        const fundLimit = BigInt(community.funds.fundLimit || "0");

        if (fundLimit > 0n && newTotal > fundLimit) {
            return res.status(400).json({ error: "Funding limit reached or exceeded" });
        }

        community.funds.contributions.push({ from, amount, txDigest });
        community.funds.totalRaised = newTotal.toString();

        await community.save();
        res.json({ success: true, community });
    } catch (err) {
        console.error("Error funding community:", err);
        res.status(500).json({ error: "Server error" });
    }
};
