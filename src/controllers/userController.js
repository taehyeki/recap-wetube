import Video from "../models/Video.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import fetch from "node-fetch";
const isHeroku = process.env.NODE_ENV;

export const getEdit = (req, res) => {
  res.render("edit-profile", { pageTitle: "Edit Profile" });
};
export const postEdit = async (req, res) => {
  const {
    session: {
      loggedUser: { _id, avatarUrl },
    },
    body: { iden, email, name },
    file,
  } = req;

  const emailExist = await User.findOne({ email });
  const idenExist = await User.findOne({ iden });
  // 위에 안나오는게 가장 베스트 안나오면 바로 업데이트 가능 근데 만약 나온다?
  // 그럼 2가지 경우를 생각해야함 1. 원래 내것인지 2. 다른사람 것인지 어떻게?
  // id를 확인하여 Exist의 id값과 req.session.loggedUser._id 값이 같다면 내가 기존에 가지고 있던 값 이경우는 됨
  // id가 다르면 기존 유저의 값이므로 이 경우에는 안됨
  if (emailExist && emailExist.id != _id) {
    return res.status(400).render("edit-profile", {
      pageTitle: "Edit Profile",
      errMessage: "EMAIL is already taken",
    });
  }
  if (idenExist && idenExist.id != _id) {
    return res.status(400).render("edit-profile", {
      pageTitle: "Edit Profile",
      errMessage: "ID is already taken",
    });
  }
  console.log(file);
  const editedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? (isHeroku ? file.location : file.path) : avatarUrl,
      iden,
      email,
      name,
    },
    { new: true }
  );
  req.session.loggedUser = editedUser;
  return res.redirect("/users/edit");
};
export const getDelete = (req, res) => {
  res.send("getDelete");
};
export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createAt: "desc" })
    .populate("owner");
  return res.render("home", {
    pageTitle: "my home",
    videos,
  });
};
export const getJoin = (req, res) => {
  return res.render("join", { pageTitle: "Join" });
};
export const postJoin = async (req, res) => {
  const { iden, email, password, password2, name } = req.body;
  const idenExists = await User.findOne({ iden });
  const emailExists = await User.findOne({ email });
  if (idenExists) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errMessage: "ID has been already taken",
    });
  }
  if (emailExists) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errMessage: "EMAIL has been already taken",
    });
  }
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errMessage: "password isnt corrent",
    });
  }
  try {
    await User.create({
      iden,
      email,
      password,
      name,
    });
    return res.redirect("/login");
  } catch (e) {
    return res
      .status(400)
      .render("join", { pageTitle: "Join", errMessage: "validation error" });
  }
};
export const getLogin = (req, res) => {
  return res.render("login", { pageTitle: "Login" });
};
export const postLogin = async (req, res) => {
  const { iden, password } = req.body;
  const user = await User.findOne({ iden, socialOnly: false });
  if (!user) {
    return res
      .status(400)
      .render("login", { pageTitle: "Login", errMessage: "ID is not correct" });
  }
  const pwOk = await bcrypt.compare(password, user.password);
  if (!pwOk)
    return res.status(400).render("login", {
      pageTitle: "Login",
      errMessage: "Password is not correct",
    });

  req.session.loggedIn = true;
  req.session.loggedUser = user;
  req.flash("info", `Hi ${user.name} 🤘`);
  return res.redirect("/");
};

export const startGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_ID,
    scope: "user:email read:user",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  res.redirect(finalUrl);
};
export const finishGithubLogin = async (req, res) => {
  const { code } = req.query;
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_ID,
    client_secret: process.env.GH_SECRET,
    code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if (!("access_token" in tokenRequest)) return res.redirect("/login");
  const apiUrl = "https://api.github.com";
  const { access_token } = tokenRequest;
  const userData = await (
    await fetch(`${apiUrl}/user`, {
      headers: {
        Authorization: `token ${access_token}`,
      },
    })
  ).json();
  const emailData = await (
    await fetch(`${apiUrl}/user/emails`, {
      headers: {
        Authorization: `token ${access_token}`,
      },
    })
  ).json();
  const emailObj = emailData.find(
    (email) => email.primary == true && email.verified == true
  );
  if (!emailObj) return res.redirect("/login");
  const existingUser = await User.findOne({ email: emailObj.email });
  if (!existingUser) {
    const user = await User.create({
      iden: userData.login,
      avatarUrl: userData.avatar_url,
      email: emailObj.email,
      name: userData.name ? userData.name : "from Github",
      password: "",
      socialOnly: true,
    });
    req.session.loggedIn = true;
    req.session.loggedUser = user;
    return res.redirect("/");
  }
  req.session.loggedIn = true;
  req.session.loggedUser = existingUser;
  return res.redirect("/");
};
export const logout = (req, res) => {
  req.session.destroy();

  return res.redirect("/");
};
export const getPW = (req, res) => {
  if (req.session.loggedUser.socialOnly === true) {
    req.flash("error", "Cant Change Password");

    return res.redirect("/");
  }
  return res.render("chenge-pw", { pageTitle: "Change PW" });
};

export const postPW = async (req, res) => {
  const {
    body: { oldpassword, newpassword, newpassword2 },
    session: {
      loggedUser: { password, _id },
    },
  } = req;
  if (!(await bcrypt.compare(oldpassword, password)))
    return res.status(400).render("chenge-pw", {
      pageTitle: "Change PW",
      errMessage: "current password is incorrect",
    });
  if (newpassword != newpassword2)
    return res.status(400).render("chenge-pw", {
      pageTitle: "Change PW",
      errMessage: "password confirm is incorrect",
    });
  const user = await User.findOne({ password });
  user.password = newpassword;
  await user.save();
  req.flash("info", "Password Updated");

  return res.redirect("/users/logout");
};

export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });

  return res.render("see", {
    pageTitle: `${user.name}s Page`,
    videos: user.videos,
    user,
  });
};
