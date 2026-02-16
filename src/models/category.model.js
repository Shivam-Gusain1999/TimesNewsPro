import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true, // "Sports" aur "sports" alag nahi maane jayenge
            index: true
        },
        slug: {
            type: String,
            lowercase: true,
            // Example: Agar name "Politics India" hai, toh slug "politics-india" hoga
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User", // Kis Admin ne ye category banayi hai
        },
        // === SENIOR DEV ADDITION (Soft Delete) ===
        isArchived: {
            type: Boolean,
            default: false // By default sab active rahenge (Delete nahi honge)
        }
    },
    {
        timestamps: true
    }
);

export const Category = mongoose.model("Category", categorySchema);