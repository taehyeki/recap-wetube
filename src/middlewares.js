import multer from "multer";
import aws from "aws-sdk";
import multerS3 from "multer-s3";

const isHeroku = process.env.NODE_ENV;

const s3 = new aws.S3({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const imageUploader = multerS3({
  s3: s3,
  bucket: "taehyeki2/images",
  acl: "public-read",
});
const videoUploader = multerS3({
  s3: s3,
  bucket: "taehyeki2/videos",
  acl: "public-read",
});
export const middleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.loggedUser = req.session.loggedUser;
  res.locals.isHeroku = isHeroku;
  next();
};

export const forLoggedUser = (req, res, next) => {
  if (req.session.loggedIn) return next();
  req.flash("error", "Log in first");
  return res.redirect("/login");
};
export const forPublic = (req, res, next) => {
  if (!req.session.loggedIn) return next();
  req.flash("error", "Not authorized");
  return res.redirect("/");
};

export const avatarUpload = multer({
  dest: "upload/avatars",
  limits: {
    fileSize: 3000000,
  },

  storage: isHeroku ? imageUploader : undefined,
});
export const videoUpload = multer({
  dest: "upload/videos",
  limits: {
    fileSize: 11000000,
  },
  storage: isHeroku ? videoUploader : undefined,
});
