const { Router } = require("express");
const postRouter = Router();
const postController = require("../controllers/postController");
const upload = require("../models/multer-config");

// get routes
postRouter.get("/all", postController.getAllPosts);
postRouter.get("/search", postController.globalSearch);
postRouter.get("/:postId", postController.getPost);


// post routes
postRouter.post("/new", upload.single("picUrl"), postController.createNewPost);
postRouter.post("/:postId/comments/new", postController.createNewComment);
postRouter.post("/:postId/likes/new", postController.createNewLike);
postRouter.post("/:postId/delete", postController.deletePost);
postRouter.post("/:postId/comments/:commentId/delete", postController.deleteComment);

module.exports = postRouter;