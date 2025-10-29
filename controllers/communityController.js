import express from 'express';
import { createCommunity, joinCommunity, leaveCommunity } from '../routes/communityRoute.js';

const communityRouter = express.Router();

communityRouter.post('/create', createCommunity)
communityRouter.post('/join/:id', joinCommunity)
communityRouter.post('/leave/:id', leaveCommunity)

export default communityRouter;