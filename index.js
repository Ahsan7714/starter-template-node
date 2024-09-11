const express = require("express");
const cors = require("cors");
const { connectDB } = require("./database/database");
const cookieParser = require("cookie-parser");
const app = express();

const PORT = 3000;

require("dotenv").config({ path: "./config/.env" });

connectDB();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
  })
);


// Set JSON payload size limit
app.use(express.json({ limit: "150mb" }));
app.use(express.urlencoded({ limit: "150mb", extended: true }));

app.use(cookieParser());

// Defining routes
const userRoutes = require("./routes/userRoutes");
const chatbotRoutes = require("./routes/chatbotRoute");
const sessionRoutes = require("./routes/sessionRoute");
const messageRoutes = require("./routes/messageRoute");

// Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/chatbot", chatbotRoutes);
app.use("/api/v1/session", sessionRoutes);
app.use("/api/v1/message", messageRoutes);


// Root route
app.get("/", (req, res) => {
  res.send("Hello World!");
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});