import { Router } from "express";
import { 
    createArticle, 
    getAllArticles, 
    getArticleBySlug, 
    updateArticle, 
    deleteArticle 
} from "../controllers/article.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").get(getAllArticles);
router.route("/:slug").get(getArticleBySlug);

router.route("/").post(
    verifyJWT, 
    upload.single("thumbnail"), 
    createArticle
);

router.route("/:articleId").patch(
    verifyJWT, 
    upload.single("thumbnail"), 
    updateArticle
);

router.route("/:articleId").delete(
    verifyJWT, 
    deleteArticle
);

export default router;