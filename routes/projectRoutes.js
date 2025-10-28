import express from "express";
import Project from "../models/Project.js";


export const createProject = async (req, res) => {
  try {
    const { owner, name, logo, description, github, liveSite, social } = req.body;
    if (!owner || !name) return res.status(400).json({ error: "owner and name required" });

    const project = new Project({ owner, name, logo, description, github, liveSite, social });
    await project.save();
    res.json({ success: true, project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * GET /api/projects
 * optional: ?owner=0x.. or ?search=...
 */
export const getProject = async (req, res) => {
  const { owner, search } = req.query;
  const filter = {};
  if (owner) filter.owner = owner;
  if (search) filter.name = { $regex: search, $options: "i" };
  const projects = await Project.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json(projects);
};

/**
 * POST /api/projects/:id/like
 * body: { user }  // wallet address
 */
export const like = async (req, res) => {
  try {
    const { user } = req.body;
    if (!user) return res.status(400).json({ error: "user required" });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    if (project.likedBy.includes(user)) {
      // Unlike
      project.likedBy = project.likedBy.filter(u => u !== user);
      project.likes = Math.max(0, project.likes - 1);
    } else {
      project.likedBy.push(user);
      project.likes += 1;
    }

    await project.save();
    res.json({ success: true, project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * POST /api/projects/:id/comment
 * body: { author, text }
 */
export const comment = async (req, res) => {
  try {
    const { author, text } = req.body;
    if (!author || !text) return res.status(400).json({ error: "author and text required" });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    project.comments.push({ author, text });
    await project.save();
    res.json({ success: true, project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * POST /api/projects/:id/fund
 * body: { from, amount, txDigest }
 * Off-chain funding record: frontend must send txDigest after signing & executing payment
 */
export const fund = async (req, res) => {
  try {
    const { from, amount, txDigest } = req.body;
    if (!from || !amount || !txDigest) return res.status(400).json({ error: "from, amount and txDigest required" });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    // You may (optionally) verify txDigest on-chain that the payment occurred to the project owner.
    // For now, store as contribution and sum up totalRaised (string addition required)
    project.funds.contributions.push({ from, amount, txDigest });
    // naive string addition: convert to BigInt for safety
    const prev = BigInt(project.funds.totalRaised || "0");
    project.funds.totalRaised = (prev + BigInt(amount)).toString();

    await project.save();
    res.json({ success: true, project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

