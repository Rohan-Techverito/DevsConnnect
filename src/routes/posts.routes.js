import { Router } from "express";
import multer from "multer";
import { requireSignIn } from "../middlewares/authMiddleware.js";
import {
  createPost,
  deletePost,
  getAllPosts,
  getFilteredPosts,
  getSinglePost,
  likePost,
  removeLikePost,
  updatePost,
} from "../controllers/postController.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "src/routes/uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });
const postRoutes = Router();

postRoutes.post("/createPost", upload.single("thumbnailImage"), createPost);
postRoutes.get("/getPosts", getAllPosts);
postRoutes.get("/getPost/:id", getSinglePost);
postRoutes.delete("/deletePost/:id", deletePost);
postRoutes.patch("/updatePost/:id", requireSignIn, updatePost);
postRoutes.put("/addLike", likePost);
postRoutes.put("/removeLike", removeLikePost);
postRoutes.get("/getFilteredPosts", getFilteredPosts);

export default postRoutes;
