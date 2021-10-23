import express from "express";
import {
  getDelete,
  getEdit,
  postEdit,
  startGithubLogin,
  finishGithubLogin,
  logout,
  getPW,
  postPW,
  see,
} from "../controllers/userController.js";
import { avatarUpload, forLoggedUser, forPublic } from "../middlewares.js";
const usersRouter = express.Router();

usersRouter.get("/:id([0-9a-f]{24})/delete", forLoggedUser, getDelete);
usersRouter
  .route("/edit")
  .all(forLoggedUser)
  .get(getEdit)
  .post(avatarUpload.single("avatar"), postEdit);
usersRouter.get("/github/start", forPublic, startGithubLogin);
usersRouter.get("/github/finish", forPublic, finishGithubLogin);
usersRouter.get("/logout", forLoggedUser, logout);
usersRouter.get("/:id([0-9a-f]{24})", see);

usersRouter.route("/change-pw").all(forLoggedUser).get(getPW).post(postPW);

export default usersRouter;
