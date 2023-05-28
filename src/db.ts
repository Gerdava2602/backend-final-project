
import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
    try {
        mongoose.connect(process.env.MONGODB_URI ?? '');
        const db = mongoose.connection;

        // Bind connection to error event (to get notification of connection errors)
        db.on("error", console.error.bind(console, "MongoDB connection error:"));

        // Bind connection to open event (to get notification of successful connection)
        db.once("open", function () {
            console.log("MongoDB connection successful");
        });
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}