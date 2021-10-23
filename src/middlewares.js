import multer from "multer";

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
});
export const videoUpload = multer({
  dest: "upload/videos",
  limits: {
    fileSize: 11000000,
  },
});
