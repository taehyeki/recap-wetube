import express from "express";
import {
  getEdit,
  postUpload,
  videoDelete,
  getUpload,
  watch,
  postEdit,
} from "../controllers/videoController.js";
import {
  forLoggedUser,
  forPublic,
  videoUpload,
  thumbUpload,
} from "../middlewares.js";
const videosRouter = express.Router();

videosRouter.get("/:id([0-9a-f]{24})", watch);
videosRouter.get("/:id([0-9a-f]{24})/delete", forLoggedUser, videoDelete);
videosRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(forLoggedUser)
  .get(getEdit)
  .post(postEdit);
videosRouter
  .route("/upload")
  .all(forLoggedUser)
  .get(getUpload)
  .post(
    videoUpload.fields([
      { name: "video", maxCount: 1 },
      { name: "thumb", maxCount: 1 },
    ]),
    postUpload
  );

export default videosRouter;
