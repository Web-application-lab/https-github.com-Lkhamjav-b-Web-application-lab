const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const root = __dirname;
const port = Number(process.env.PORT) || 3000;
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const orderRoutes = require("./routes/order");
const reviewRoutes = require("./routes/review");




mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

app.use(express.json());
app.use(express.static(root));
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);


function sendSpa(req, res) {
  res.sendFile(path.join(root, "index.html"));
}

app.get("/", sendSpa);
app.get("/c", sendSpa);
app.get("/c/*", sendSpa);
app.get("/b", sendSpa);
app.get("/b/*", sendSpa);
app.get("/login", sendSpa);
app.get("/signup", sendSpa);
app.get("/profile", sendSpa);
app.get("/orders", sendSpa);
app.get("/account/profile", sendSpa);
app.get("/account/orders", sendSpa);
app.get("/admin", sendSpa);



app.get("/api/data", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const [products, categories, subCategories, concerns, navDocs] = await Promise.all([
      db.collection("products").find({}).toArray(),
      db.collection("categories").find({}).toArray(),
      db.collection("subcategories").find({}).toArray(),
      db.collection("concerns").find({}).toArray(),
      db.collection("navigation").find({}).toArray(),
    ]);

    const categoryNavigation = navDocs[0] || { bySlug: {}, byName: {} };

    res.json({ products, categories, subCategories, concerns, categoryNavigation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`BeautyShop running at http://localhost:${port}`);
});