const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor1", required: true }, // ✅ Correct
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true }, // ✅ Correct
  image: { type: String, required: true },
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
