import express from 'express';
import { createCommunity, joinCommunity, leaveCommunity, getCommunities } from '../routes/communityRoute.js';

const communityRouter = express.Router();

communityRouter.post('/create', createCommunity)
communityRouter.post('/join/:id', joinCommunity)
communityRouter.post('/leave/:id', leaveCommunity)
communityRouter.get('/', getCommunities)

export default communityRouter;