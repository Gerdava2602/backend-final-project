import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required:true,
    },
    name: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required:true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required:true,
    },
    active: {
        type: Boolean,
        default: true,
    }
});

export default mongoose.model("User", UserSchema);