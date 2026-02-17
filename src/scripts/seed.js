import mongoose from "mongoose";
import { Article } from "../models/article.model.js";
import { Category } from "../models/category.model.js";
import { User } from "../models/user.model.js";
import dotenv from "dotenv";
import { DB_NAME } from "../constants.js";

dotenv.config();

const seedProfessionalData = async () => {
    try {
        console.log("🚀 Senior Developer Seeding Process Started...");
      await mongoose.connect(process.env.MONGODB_URI, {
    dbName: DB_NAME  // <--- Ye hai magic! Ye force karega sahi DB par jane ke liye
});
        
        // 1. Cleanup: Purana messy data clear karo (Optional but recommended for testing)
        await Article.deleteMany({});
        await Category.deleteMany({});

        // 2. Admin User ensure karo
        let user = await User.findOne();
        if (!user) {
            user = await User.create({
                username: "shivam_admin",
                email: "admin@timesnews.com",
                password: "password123",
                fullName: "Shivam Gusain"
            });
        }

        // 3. UI ke hisaab se Categories define karo
        const categoriesData = [
            { name: "Politics", description: "National and International Politics" },
            { name: "Sports", description: "Cricket, Football, and more" },
            { name: "Technology", description: "AI, Gadgets, and Software" },
            { name: "Entertainment", description: "Movies and Lifestyle" },
            { name: "Business", description: "Stock Market and Economy" }
        ];

        const createdCategories = await Category.insertMany(categoriesData);
        console.log("✅ Categories Created:", createdCategories.map(c => c.name));

        // 4. Har Category ke liye Professional Articles
        const articles = [];

        createdCategories.forEach((cat) => {
            for (let i = 1; i <= 4; i++) {
                articles.push({
                    title: `${cat.name} Major Update: Important News ${i}`,
                    content: `This is a high-quality professional news content for ${cat.name}. It covers all the essential aspects of the latest developments in this sector.`,
                    slug: `${cat.name.toLowerCase()}-news-${i}-${Date.now()}`,
                    thumbnail: `https://picsum.photos/seed/${cat.name}${i}/800/450`, // Professional Random Images
                    category: cat._id,
                    author: user._id,
                    views: Math.floor(Math.random() * 90000) + 10000, // 10k to 100k views for that 'K' look
                    isFeatured: i === 1 && cat.name === "Politics" ? true : false, // Sirf ek Politics article Hero banega
                    status: "PUBLISHED"
                });
            }
        });

        await Article.insertMany(articles);
        console.log(`🎉 Success: ${articles.length} Professional Articles Seeded!`);

    } catch (error) {
        console.error("💥 Senior Script Error:", error.message);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

seedProfessionalData();