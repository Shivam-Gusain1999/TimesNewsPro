// ------------------ External Packages ------------------
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// ------------------ Middlewares ------------------
import { errorHandler } from "./middlewares/error.middleware.js";

// ------------------ Routes ------------------
import userRouter from "./routes/user.routes.js";
import categoryRouter from "./routes/category.routes.js";
import articleRouter from "./routes/article.routes.js"

const app = express();

// ------------------ Global Middlewares ------------------
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// ------------------ Routes ------------------
app.use("/api/v1/users", userRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/articles", articleRouter);



// ------------------ Error Handler ------------------
app.use(errorHandler);

export default app;
