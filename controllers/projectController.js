import express from "express";
import { comment, createProject, fund, getProject, like } from "../routes/projectRoutes.js";

const projectRouter = express.Router()

projectRouter.post("/", createProject);
projectRouter.get("/", getProject);
projectRouter.post("/:id/like", like);
projectRouter.post("/:id/comment", comment);
projectRouter.post("/:id/fund", fund)

export default projectRouter;