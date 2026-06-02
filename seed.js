const mongoose = require("mongoose");
require("dotenv").config();

const data = require("./products.json");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;

  await db.collection("categories").deleteMany({});
  await db.collection("categories").insertMany(data.categories);
  console.log(`Inserted ${data.categories.length} categories`);

  await db.collection("subcategories").deleteMany({});
  await db.collection("subcategories").insertMany(data.subCategories);
  console.log(`Inserted ${data.subCategories.length} subcategories`);

  await db.collection("products").deleteMany({});
  const productsWithStock = data.products.map(p => ({
    ...p,
    stock:   p.stock ?? 10,
    rating:  0,
    reviews: 0
  }));
  await db.collection("products").insertMany(productsWithStock);
  console.log(`Inserted ${productsWithStock.length} products`);

  await db.collection("concerns").deleteMany({});
  await db.collection("concerns").insertMany(data.concerns);
  console.log(`Inserted ${data.concerns.length} concerns`);

  await db.collection("navigation").deleteMany({});
  await db.collection("navigation").insertOne(data.categoryNavigation);
  console.log("Inserted categoryNavigation");

  // Reviews-аас rating дахин тооцоолох — db.collection ашиглана
  const reviews = await db.collection("reviews").find({}).toArray();
  if (reviews.length) {
    const grouped = {};
    reviews.forEach(r => {
      if (!grouped[r.productId]) grouped[r.productId] = [];
      grouped[r.productId].push(r.rating);
    });

    for (const [productId, ratings] of Object.entries(grouped)) {
      const avg = ratings.reduce((s, r) => s + r, 0) / ratings.length;
      await db.collection("products").updateOne(
        { id: Number(productId) },
        { $set: {
          rating:  Math.round(avg * 10) / 10,
          reviews: ratings.length
        }}
      );
    }
    console.log(`Fixed ratings for ${Object.keys(grouped).length} products`);
  } else {
    console.log("Review байхгүй байна");
  }

  await mongoose.disconnect();
  console.log("Done!");
}

seed().catch(console.error);