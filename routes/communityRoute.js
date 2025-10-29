import Community from "../models/Community";
import Message from "../models/Message";


export const createCommunity = async (req, res) => {
    try {
        const { name, description, userId } = req.body;
        const community = await Community.create({ name, description, creator: userId, members: [userId] });
  res.json(community);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}


export const joinCommunity = async (req, res) => {
    try {
        const { userId } = req.body;
        const community = await Community.findById(req.params.id);
        if (!community.members.includes(userId)) {
            community.members.push(userId);
            await community.save();
        }
        res.json({ message: "Joined community", community });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}


export const leaveCommunity = async (req, res) => {
    try {
        const { userId } = req.body;
        await Community.findByIdAndUpdate(req.params.id, { $pull: { members: userId } });
        res.json({ message: "Left community" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}

export const getCommunityMessages = async (req, res) => {
    try {
        const messages = await Message.find({ community: req.params.id }).populate('sender', 'username');
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}