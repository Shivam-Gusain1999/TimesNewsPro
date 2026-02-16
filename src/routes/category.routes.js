import { Router } from "express";
import { 
    createCategory, 
    getAllCategories, 
    deleteCategory, 
    updateCategory 
} from "../controllers/category.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = Router();


router.route("/").get(getAllCategories);


router.route("/").post(verifyJWT, verifyAdmin, createCategory);


router.route("/:categoryId").patch(verifyJWT, verifyAdmin, updateCategory);


router.route("/:categoryId").delete(verifyJWT, verifyAdmin, deleteCategory);

export default router;