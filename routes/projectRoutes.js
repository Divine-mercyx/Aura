import Project from "../models/Project.js";

// Create a new project
export const createProject = async (req, res) => {
    try {
        const { owner, name, logo, description, github, liveSite, social } = req.body;

        if (!owner || !name) {
            return res.status(400).json({
                success: false,
                message: "Owner and name are required",
            });
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

        res.status(201).json({
            success: true,
            message: "Project created successfully",
            data: project,
        });
    } catch (error) {
        console.error("Create project error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get filtered projects
export const getProject = async (req, res) => {
    try {
        const { owner, search } = req.query;
        const filter = {};

        if (owner) filter.owner = owner;
        if (search) filter.name = { $regex: search, $options: "i" };

        const projects = await Project.find(filter)
            .sort({ createdAt: -1 })
            .limit(100);

        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects,
        });
    } catch (error) {
        console.error("Get project error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get all projects
export const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects,
        });
    } catch (error) {
        console.error("Get all projects error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Like or unlike a project
export const like = async (req, res) => {
    try {
        const { user } = req.body;

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User is required",
            });
        }

        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        if (project.likedBy.includes(user)) {
            project.likedBy = project.likedBy.filter(u => u !== user);
            project.likes = Math.max(0, project.likes - 1);
        } else {
            project.likedBy.push(user);
            project.likes += 1;
        }

        await project.save();

        res.status(200).json({
            success: true,
            message: "Project like status updated",
            data: project,
        });
    } catch (error) {
        console.error("Like project error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Comment on a project
export const comment = async (req, res) => {
    try {
        const { author, text } = req.body;

        if (!author || !text) {
            return res.status(400).json({
                success: false,
                message: "Author and text are required",
            });
        }

        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        project.comments.push({ author, text });
        await project.save();

        res.status(200).json({
            success: true,
            message: "Comment added successfully",
            data: project,
        });
    } catch (error) {
        console.error("Comment project error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Fund a project
export const fund = async (req, res) => {
    try {
        const { from, amount, txDigest } = req.body;

        if (!from || !amount || !txDigest) {
            return res.status(400).json({
                success: false,
                message: "from, amount, and txDigest are required",
            });
        }

        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        const prev = BigInt(project.funds.totalRaised || "0");
        const newTotal = prev + BigInt(amount);
        const fundLimit = BigInt(project.funds.fundLimit || "0");

        if (fundLimit > 0n && newTotal > fundLimit) {
            return res.status(400).json({
                success: false,
                message: "Funding limit reached or exceeded",
            });
        }

        project.funds.contributions.push({ from, amount, txDigest });
        project.funds.totalRaised = newTotal.toString();

        await project.save();

        res.status(200).json({
            success: true,
            message: "Project funded successfully",
            data: project,
        });
    } catch (error) {
        console.error("Fund project error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
