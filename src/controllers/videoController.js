import Video from "../models/Video.js";
import User from "../models/User.js";
import Comment from "../models/Comment";

export const getUpload = (req, res) => {
  res.render("upload", { pageTitle: "Upload Video" });
};
export const postUpload = async (req, res) => {
  const { video, thumb } = req.files;
  const {
    session: {
      loggedUser: { _id },
    },
  } = req;
  const { title, description, hashtags } = req.body;
  try {
    const newVideo = await Video.create({
      videoUrl: video[0].location,
      thumbUrl: thumb[0].location,
      title,
      description,
      hashtags: Video.formatHashtags(hashtags),
      owner: _id,
    });
    let user = await User.findById({ _id });
    user.videos.push(newVideo._id);
    await user.save();
    req.flash("success", "✅ your video was successfully uploaded");
    return res.redirect("/");
  } catch (e) {
    return res.status(400).render("upload", { pageTitle: "video upload" });
  }
};
export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    session: {
      loggedUser: { _id },
    },
  } = req;
  const video = await Video.findById(id).populate("owner");
  console.log(video);
  if (!video) return res.status(404).render("404");
  if (_id !== video.owner.id) {
    req.flash("error", "Not authorized");
    return res.redirect("/");
  }
  return res.render("videoEdit", { pageTitle: "Edit Video", video });
};
export const postEdit = async (req, res) => {
  const { id } = req.params;
  const {
    session: {
      loggedUser: { _id },
    },
  } = req;
  const exist = await Video.exists({ _id: id });
  if (!exist) {
    return res.render("404", { pageTitle: "file not found" });
  }
  const { title, description, hashtags } = req.body;
  const video = await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  if (_id !== String(video.owner)) {
    req.flash("error", "you are not the owner of the video");
    return res.redirect("/");
  }
  return res.redirect("/");
};
export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner").populate("comments");
  if (video) {
    return res.render("watch", { pageTitle: video.title, video });
  }
  return res.render("404", { pageTitle: "file is not founded" });
};

export const videoDelete = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner");
  if (!video) {
    return res.render("404", { pageTitle: "file not found" });
  }
  const {
    session: {
      loggedUser: { _id },
    },
  } = req;
  if (_id !== video.owner.id) return res.redirect("/");
  const user = await User.findById(video.owner.id);
  const a = user.videos.indexOf(id);
  user.videos.splice(a, 1);
  await user.save();
  await Video.findByIdAndDelete(id);

  return res.redirect("/");
};
export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"),
      },
    }).populate("owner");
  }
  return res.render("search", { pageTitle: "Search Title", videos });
};
export const vp = async (req, res) => {
  const id = req.params.id;
  const video = await Video.findById(id);
  if (!video) return res.sendStatus(404);
  video.meta.views += 1;
  await video.save();
  res.sendStatus(200);
};
export const createComment = async (req, res) => {
  const {
    body: { text },
    params: { id },
  } = req;
  const ownerId = req.session.loggedUser._id;

  const comment = await Comment.create({
    text,
    owner: ownerId,
    video: id,
  });
  const owner = await User.findById(ownerId);
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus("404");
  }
  video.comments.push(comment.id);
  owner.comments.push(comment.id);
  await video.save();
  await owner.save();
  return res.status("201").json({ newCommentId: comment.id });
};

export const deleteComment = async (req, res) => {
  const commentId = req.params.id;
  const comment = await Comment.findById(commentId);
  if (!comment) {
    req.flash("error", "it dosent exist");
    return res.sendStatus("404");
  }
  const userId = req.session.loggedUser._id;
  if (comment.owner != userId) {
    req.flash("error", "Your not a writer");
    return res.sendStatus("404");
  }
  await Comment.findByIdAndDelete(commentId);
  return res.sendStatus("200");
};
