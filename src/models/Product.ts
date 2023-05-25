import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    min: 0,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  category: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model("Product", ProductSchema);
