import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;

 
    if (!name?.trim()) {
        throw new ApiError(400, "Category name is required");
    }

  
    const slug = name
  .toLowerCase()
  .trim()
  .replace(/[^\w\s-]/g, "")   // special characters remove
  .replace(/\s+/g, "-");      // multiple spaces ko ek dash me convert


  
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
        throw new ApiError(409, "Category with this name already exists");
    }


    const category = await Category.create({
        name,
        slug,
        owner: req.user._id 
    });

   
    return res.status(201).json(
        new ApiResponse(201, category, "Category created successfully")
    );
});


const getAllCategories = asyncHandler(async (req, res) => {

    const categories = await Category.find({ isArchived: false }).select("name slug _id");

    return res.status(200).json(
        new ApiResponse(200, categories, "All active categories fetched successfully")
    );
});

// === Update Category (Admin Only) ===
const updateCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const { name } = req.body;

    if (!name?.trim()) {
        throw new ApiError(400, "New category name is required");
    }

    const category = await Category.findById(categoryId);

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    // Naya slug generate karo
    const slug = name.toLowerCase().replace(/ /g, "-");

    // Update fields
    category.name = name;
    category.slug = slug;

    await category.save();

    return res.status(200).json(
        new ApiResponse(200, category, "Category updated successfully")
    );
});

const deleteCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;

    const category = await Category.findByIdAndUpdate(
        categoryId,
        { isArchived: true }, // Delete nahi, bas flag true kiya
        { new: true }
    );

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    return res.status(200).json(
        new ApiResponse(200, category, "Category archived successfully")
    );
});


export { 
    createCategory, 
    getAllCategories, 
    updateCategory,
    deleteCategory 
};