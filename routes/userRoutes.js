import express from "express";
import User from "../models/User.js";

const router = express.Router();

export const checkIfAccountExists = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const user = await User.findOne({ walletAddress });

    if (!user) return res.json({ exists: false });
    return res.json({ exists: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const createAccount =  async (req, res) => {
  try {
    const { walletAddress, handle, image } = req.body;

    const existing = await User.findOne({ walletAddress });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const newUser = new User({ walletAddress, handle, image });
    await newUser.save();

    res.json({ success: true, user: newUser });
  } catch (error) {
    console.error(error);
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
