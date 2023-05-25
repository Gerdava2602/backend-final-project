import mongoose from "mongoose";

const Schema = mongoose.Schema;

const DeliverySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["pending", "delivered"],
        default: "pending"
    },
    comments: {
        type: String,
        required: false
    },
    score: {
        type: Number,
        required: false,
        min: 1,
        max: 5
    }
});

export default mongoose.model("Delivery", DeliverySchema);