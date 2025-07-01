import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.use(express.json());
import dbConnect from "./config/db.js";

dbConnect();









// Routes
import userRoutes from "./routes/userRoutes.js"
import mailRoutes from "./routes/Mail Routes/Auth/verifyMailRoutes.js"
import postRoutes from "./routes/postRoutes.js"
import commentRoutes from "./routes/commentRoutes.js"


// user routes
app.use('/api/v1/user', userRoutes)

// mail routes
app.use('/api/v1/mail', mailRoutes)

// post routes
app.use('/api/v1/post', postRoutes)

// comment routes
app.use('/api/v1/comment', commentRoutes)




app.get("/", (req, res) => {
    res.send("Server is running...");
    });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});