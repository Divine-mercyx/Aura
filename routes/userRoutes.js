import express from "express";
import User from "../models/User.js";

const router = express.Router();

// export const checkIfAccountExists = async (req, res) => {
//   try {
//     const { walletAddress } = req.body;
//     const user = await User.findOne({ walletAddress });

//     if (!user) return res.json({ exists: false });
//     return res.json({ exists: true, user });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

export const createAccount = async (req, res) => {
    try {
        const { walletAddress, handle, image } = req.body;

        if (!walletAddress) {
            return res.status(400).json({ error: "walletAddress is required" });
        }

        let user = await User.findOne({ walletAddress });

        if (!user) {
            user = new User({ walletAddress, handle, image });
            await user.save();
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error("Error creating/fetching account:", error);
        res.status(500).json({ error: "Server error" });
    }
};


export const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ walletAddress: req.params.walletAddress });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export default router;
