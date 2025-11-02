import express from "express";
import Project from "../models/Project.js";

/**
 * POST /api/projects
 * body: { owner, name, logo, description, github, liveSite, social }
 */
export const createProject = async (req, res) => {
    try {
        const { owner, name, logo, description, github, liveSite, social } = req.body;
        if (!owner || !name) {
            return res.status(400).json({ error: "owner and name required" });
        }

        const project = new Project({
            owner,
            name,
            logo,
            description,
            github,
            liveSite,
            social
        });

        await project.save();
        res.json({ success: true, project });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

/**
 * GET /api/projects
 * optional query: ?owner=0x.. or ?search=...
 */
export const getProject = async (req, res) => {
    try {
        const { owner, search } = req.query;
        const filter = {};

        if (owner) filter.owner = owner;
        if (search) filter.name = { $regex: search, $options: "i" };

        const projects = await Project.find(filter)
            .sort({ createdAt: -1 })
            .limit(100);

        res.json(projects);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

/**
 * GET /api/projects/all
 * returns all projects without filters
 */
export const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json({ success: true, projects });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
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
        if (!author || !text)
            return res.status(400).json({ error: "author and text required" });

        const project = await Project.findById(req.params.id);
        if (!project)
            return res.status(404).json({ error: "Project not found" });

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
 */
export const fund = async (req, res) => {
    try {
        const { from, amount, txDigest } = req.body;
        if (!from || !amount || !txDigest)
            return res.status(400).json({ error: "from, amount and txDigest required" });

        const project = await Project.findById(req.params.id);
        if (!project)
            return res.status(404).json({ error: "Project not found" });

        const prev = BigInt(project.funds.totalRaised || "0");
        const newTotal = prev + BigInt(amount);

        // Prevent exceeding fund limit (if specified)
        const fundLimit = BigInt(project.funds.fundLimit || "0");
        if (fundLimit > 0n && newTotal > fundLimit) {
            return res.status(400).json({ error: "Funding limit reached or exceeded" });
        }

        project.funds.contributions.push({ from, amount, txDigest });
        project.funds.totalRaised = newTotal.toString();

        await project.save();
        res.json({ success: true, project });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};
