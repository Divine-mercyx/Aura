import express from 'express';
import {
    createCommunity,
    joinCommunity,
    leaveCommunity,
    getCommunities,
    getCommunityMessages, getCommunityById, fundCommunity
} from '../routes/communityRoute.js';

const router = express.Router();

router.post("/communities", createCommunity);
router.get("/communities", getCommunities);
router.get("/communities/:id", getCommunityById);
router.post("/communities/:id/join", joinCommunity);
router.post("/communities/:id/leave", leaveCommunity);
router.post("/communities/:id/fund", fundCommunity);
router.get("/communities/:id/messages", getCommunityMessages);


export default router;