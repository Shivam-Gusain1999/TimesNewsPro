import { Article } from "../models/article.model.js";
import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ROLES, PERMISSIONS } from "../constants/roles.constant.js";

// ============================================================================
// 1. CREATE ARTICLE (Secure & Optimized)
// ============================================================================
const createArticle = asyncHandler(async (req, res) => {
    const { title, content, categoryId, tags, isFeatured } = req.body;

    // Validation: Required fields check
    if ([title, content, categoryId].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Title, Content and Category are required");
    }

    // Category Exist Karti Hai?
    // Note: Hum yahan bhi check kar rahe hain ki Category 'Archived' toh nahi hai
    const category = await Category.findOne({ _id: categoryId, isArchived: false });
    if (!category) {
        throw new ApiError(404, "Invalid or Archived Category");
    }

    // Slug Generation (SEO Friendly & Unique)
    // Regex: Special chars hata kar dash (-) lagayega aur end mein Timestamp jodeka
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") // Sirf a-z aur 0-9 rakho
        .replace(/^-+|-+$/g, "")     // Start/End ke dash hatao
        + "-" + Date.now();          // Unique Timestamp

    // Image Upload Handling
    const thumbnailLocalPath = req.file?.path;
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail image is required");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail) {
        throw new ApiError(500, "Error while uploading thumbnail to Cloudinary");
    }

    // Role Based Status (RBAC)
    // Admin/Editor -> PUBLISHED | User -> DRAFT
    let status = "DRAFT";
    if (req.user && PERMISSIONS.CAN_PUBLISH.includes(req.user.role)) {
        status = "PUBLISHED";
    }

    // Database Entry
    const article = await Article.create({
        title,
        content,
        slug,
        thumbnail: thumbnail.url,
        category: categoryId,
        author: req.user._id,
        tags: tags ? tags.split(",") : [], // "Tech,News" -> ["Tech", "News"]
        isFeatured: isFeatured || false,
        status,
        isArchived: false // Default active
    });

    return res.status(201).json(
        new ApiResponse(201, article, "Article created successfully")
    );
});

// ============================================================================
// 2. GET ALL ARTICLES (With Search, Filter & Pagination)
// ============================================================================
const getAllArticles = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, category } = req.query;

    // Base Query: Sirf Published aur Active articles dikhao
    const query = { 
        status: "PUBLISHED", 
        isArchived: false 
    };

    // 1. Search Logic (Title mein dhoondo)
    if (search) {
        query.title = { $regex: search, $options: "i" }; // 'i' means case-insensitive
    }

    // 2. Category Filter
    if (category) {
        const categoryDoc = await Category.findOne({ slug: category, isArchived: false });
        if (categoryDoc) {
            query.category = categoryDoc._id;
        }
    }

    // 3. Pagination Logic
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 }, // Latest pehle
        populate: [
            { path: "author", select: "fullName username avatar" }, // Author details
            { path: "category", select: "name slug" }               // Category details
        ]
    };

    // Note: Agar tumne AggregatePaginate plugin lagaya hai toh hum aggregate use kar sakte hain,
    // lekin simple find query zyada fast aur readable hai is case mein.
    
    const skip = (options.page - 1) * options.limit;
    
    const articles = await Article.find(query)
        .populate("author", "fullName username avatar")
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(options.limit);

    const totalArticles = await Article.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            articles,
            pagination: {
                total: totalArticles,
                page: options.page,
                limit: options.limit,
                totalPages: Math.ceil(totalArticles / options.limit)
            }
        }, "Articles fetched successfully")
    );
});

// ============================================================================
// 3. GET SINGLE ARTICLE (By Slug)
// ============================================================================
const getArticleBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    // View Count Badhana (Optional feature, abhi simple rakha hai)
    const article = await Article.findOneAndUpdate(
        { slug, status: "PUBLISHED", isArchived: false },
        { $inc: { views: 1 } }, // Views +1
        { new: true }
    )
    .populate("author", "fullName username bio avatar")
    .populate("category", "name slug");

    if (!article) {
        throw new ApiError(404, "Article not found or has been archived");
    }

    return res.status(200).json(
        new ApiResponse(200, article, "Article fetched successfully")
    );
});

// ============================================================================
// 4. UPDATE ARTICLE (Secure Update)
// ============================================================================
const updateArticle = asyncHandler(async (req, res) => {
    const { articleId } = req.params;
    const { title, content, categoryId, status } = req.body;

    const article = await Article.findById(articleId);

    if (!article || article.isArchived) { // Archived articles update nahi honge
        throw new ApiError(404, "Article not found");
    }

    // Security Check: Kya ye wahi author hai ya Admin hai?
    if (article.author.toString() !== req.user._id.toString() && req.user.role !== ROLES.ADMIN) {
        throw new ApiError(403, "You are not authorized to edit this article");
    }

    // Image Handling: Agar nayi file aayi hai tabhi update karo
    // Purani delete nahi kar rahe (Safety Backup)
    if (req.file?.path) {
        const newThumbnail = await uploadOnCloudinary(req.file.path);
        if (newThumbnail) {
            article.thumbnail = newThumbnail.url;
        }
    }

    // Fields Update
    if (title) article.title = title;
    if (content) article.content = content;
    if (categoryId) article.category = categoryId;

    // Status Update (Sirf permitted roles ke liye)
    if (status && PERMISSIONS.CAN_PUBLISH.includes(req.user.role)) {
        article.status = status;
    }

    await article.save();

    return res.status(200).json(
        new ApiResponse(200, article, "Article updated successfully")
    );
});

// ============================================================================
// 5. DELETE ARTICLE (Soft Delete / Archive)
// ============================================================================
const deleteArticle = asyncHandler(async (req, res) => {
    const { articleId } = req.params;

    const article = await Article.findById(articleId);

    if (!article || article.isArchived) {
        throw new ApiError(404, "Article not found");
    }

    // Security Check
    if (article.author.toString() !== req.user._id.toString() && req.user.role !== ROLES.ADMIN) {
        throw new ApiError(403, "You are not authorized to delete this article");
    }

    // SOFT DELETE LOGIC
    // Hum record database se nahi uda rahe, bas chhupa rahe hain.
    article.isArchived = true;
    article.status = "ARCHIVED"; 

    // Validation skip kiya kyunki hum bas status badal rahe hain
    await article.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, {}, "Article moved to archive (Soft Deleted)")
    );
});

export {
    createArticle,
    getAllArticles,
    getArticleBySlug,
    updateArticle,
    deleteArticle
};