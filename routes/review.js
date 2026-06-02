const express  = require("express");
const router   = express.Router();
const Review   = require("../models/Review");
const mongoose = require("mongoose"); // ← нэмэх

router.get("/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ productId: Number(req.params.productId) })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { productId, userId, userName, rating, comment } = req.body;

    if (!productId || !userId || !rating || !comment)
      return res.status(400).json({ error: "Мэдээлэл дутуу байна" });

    const existing = await Review.findOne({ productId: Number(productId), userId });
    if (existing)
      return res.status(400).json({ error: "Та аль хэдийн сэтгэгдэл үлдээсэн байна" });

    const review = await Review.create({
      productId: Number(productId),
      userId, userName, rating, comment
    });

    // Дундаж rating тооцоолох
    const allReviews = await Review.find({ productId: Number(productId) });
    const avgRating  = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    // Products collection шинэчлэх
    const db = mongoose.connection.db;
    await db.collection("products").updateOne(
      { id: Number(productId) },
      {
        $set: {
          rating:  Math.round(avgRating * 10) / 10,
          reviews: allReviews.length
        }
      }
    );

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;