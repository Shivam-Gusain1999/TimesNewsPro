import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const articleSchema = new Schema(
    {
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true
        },
        title: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        content: {
            type: String,
            required: true
        },
        thumbnail: {
            type: String, // Cloudinary url
            required: true
        },
        status: {
            type: String,
            enum: ["DRAFT", "PUBLISHED", "ARCHIVED", "BLOCKED"],
            default: "DRAFT",
            index: true
        },
        // === YAHAN BHI ADD KARO (Soft Delete) ===
        isArchived: {
            type: Boolean,
            default: false
        },
        // ========================================
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isFeatured: {
            type: Boolean,
            default: false
        },
        tags: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

articleSchema.plugin(mongooseAggregatePaginate);

export const Article = mongoose.model("Article", articleSchema);