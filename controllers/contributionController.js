import express from "express";
import {
    createContribution,
    getAllContributions,
    getContributionById,
    getContributionsByCommunity,
} from "../routes/contributionRoutes.js";

const router = express.Router();

router.post("/", createContribution);
router.get("/", getAllContributions);
router.get("/:id", getContributionById);
router.get("/community/:communityId", getContributionsByCommunity);

export default router;
