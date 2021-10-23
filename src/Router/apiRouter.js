import express from "express";
import { forLoggedUser, forPublic } from "../middlewares.js";
import {
  vp,
  createComment,
  deleteComment,
} from "../controllers/videoController";
const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/vp", vp);
apiRouter.post(
  "/videos/:id([0-9a-f]{24})/comment",
  forLoggedUser,
  createComment
);
apiRouter.delete(
  "/videos/:id([0-9a-f]{24})/delete",
  forLoggedUser,
  deleteComment
);

export default apiRouter;
