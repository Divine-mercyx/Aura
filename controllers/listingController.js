import express from "express"
import { acceptListing, cancelListing, completeListing, getListing, listAsset } from "../routes/listingRoutes.js"

const listRouter = express.Router()

listRouter.post("/", listAsset);
listRouter.get("/", getListing);
listRouter.post("/:id/accept", acceptListing);
listRouter.post("/:id/complete", completeListing);
listRouter.post("/:id/cancel", cancelListing);

export default listRouter;