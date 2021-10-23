const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const dels = document.querySelectorAll(".del");
const addComment = (text, commentId) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.dataset.id = commentId;
  newComment.className = "video__comment";
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  const span = document.createElement("span");
  span.innerText = ` ${text}`;
  const span2 = document.createElement("span");
  span2.innerText = ` ❌`;

  span2.addEventListener("click", handleDelete);
  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(span2);
  videoComments.prepend(newComment);
};

const handleDelete = async (e) => {
  const liParent = e.target.parentElement;
  const commentId = liParent.dataset.id;
  const response = await fetch(`/api/videos/${commentId}/delete`, {
    method: "delete",
  });
  if (response.status == "200") {
    liParent.remove();
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();

  const textarea = form.querySelector("textarea");
  const id = videoContainer.dataset.id;
  const text = textarea.value;
  if (text == "") return;
  const response = await fetch(`/api/videos/${id}/comment`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  textarea.value = "";
  if (response.status == "201") {
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
  }
};

if (form) {
  const btn = form.querySelector("button");
  btn.addEventListener("click", handleSubmit);
}
if (dels) {
  dels.forEach((del) => del.addEventListener("click", handleDelete));
}
