import { Article } from "../models/article.model.js";
import { Category } from "../models/category.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getDashboardStats = asyncHandler(async (req, res) => {
    // Sab kuch parallel mein fetch karenge (Fastest Way)
    const [stats, categoryCount, latestArticles] = await Promise.all([
        // 1. Total Articles & Views count karna
        Article.aggregate([
            {
                $group: {
                    _id: null,
                    totalArticles: { $sum: 1 },
                    totalViews: { $sum: "$views" }, // Saare views ka jod (Sum)
                    archivedCount: { 
                        $sum: { $cond: [{ $eq: ["$isArchived", true] }, 1, 0] } 
                    }
                }
            }
        ]),
        
        // 2. Total Categories count karna
        Category.countDocuments(),

        // 3. Top 5 Latest Articles lana (Frontend ke 'Recent News' table ke liye)
        Article.find({ isArchived: false })
            .sort({ createdAt: -1 }) // Sabse naya pehle
            .limit(5)
            .populate("category", "name") // Category ka naam bhi chahiye
            .select("title views status createdAt category")
    ]);

    // Data ko clean format mein pack karo
    const dashboardData = {
        totalArticles: stats[0]?.totalArticles || 0,
        totalViews: stats[0]?.totalViews || 0,
        archivedArticles: stats[0]?.archivedCount || 0,
        totalCategories: categoryCount || 0,
        latestArticles
    };

    return res.status(200).json(
        new ApiResponse(200, dashboardData, "Admin dashboard stats fetched successfully")
    );
});

export { getDashboardStats };