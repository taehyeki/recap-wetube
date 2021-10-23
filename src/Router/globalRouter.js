import express from "express";
import {
  home,
  getLogin,
  getJoin,
  postLogin,
  postJoin,
} from "../controllers/userController.js";
import { search } from "../controllers/videoController.js";
import { forLoggedUser, forPublic } from "../middlewares.js";
const globalRouter = express.Router();

globalRouter.get("/", home);
globalRouter.get("/search", search);
globalRouter.route("/join").all(forPublic).get(getJoin).post(postJoin);
globalRouter.route("/login").all(forPublic).get(getLogin).post(postLogin);
export default globalRouter;
