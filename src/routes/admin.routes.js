import { Router } from "express";
import { getDashboardStats } from "../controllers/admin.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get Admin Dashboard Statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalArticles:
 *                       type: integer
 *                     totalViews:
 *                       type: integer
 *       401:
 *         description: Unauthorized (Token missing or invalid)
 *       403:
 *         description: Forbidden (Admin access required)
 */
router.get("/stats", verifyJWT, verifyAdmin, getDashboardStats);

export default router;
