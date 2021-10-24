import multer from "multer";
import aws from "aws-sdk";
import multerS3 from "multer-s3";

const s3 = new aws.S3({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const multerUploader = multerS3({
  s3: s3,
  bucket: "taehyeki2",
  acl: "public-read",
});
export const middleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.loggedUser = req.session.loggedUser;
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

  storage: multerUploader,
});
export const videoUpload = multer({
  dest: "upload/videos",
  limits: {
    fileSize: 11000000,
  },
  storage: multerUploader,
});
