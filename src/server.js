import express from "express";
import morgan from "morgan";
import MongoStore from "connect-mongo";
import session from "express-session";
import flash from "express-flash";
import globalRouter from "./Router/globalRouter.js";
import usersRouter from "./Router/usersRouter.js";
import videosRouter from "./Router/videosRouter.js";
import { middleware } from "./middlewares.js";
import apiRouter from "./Router/apiRouter.js";

const server = express();
const logger = morgan("dev");
server.set("view engine", "pug");
server.set("views", process.cwd() + "/src/views");
server.use(logger);
server.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);
server.use((req, res, next) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
});
server.use(flash());
server.use("/upload", express.static("upload"));
server.use("/assets", express.static("assets"));
server.use(middleware);
server.use(express.urlencoded({ extended: true }));
server.use(express.json());
server.use("/", globalRouter);
server.use("/videos", videosRouter);
server.use("/users", usersRouter);
server.use("/api", apiRouter);

export default server;
