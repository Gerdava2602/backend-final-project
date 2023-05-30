import mongoose from 'mongoose';
import Product from "./models/Product";
import User from "./models/User";

export default async () => {
    await mongoose.connect('mongodb://root:example@localhost:27017/test_db?authSource=admin');

    let user = await User.findOne({ username: 'test' });

    if (!user) {
        user = await User.create({
            username: 'test',
            email: 'test@email.com',
            password: 'test',
            name: 'test',
            lastname: 'test',
            phone: 'test',
            address: 'test'
        });
    }

    const product = await Product.create({
        name: 'test',
        price: 10,
        description: 'test',
        image: 'test',
        category: 'test',
        user: user._id
    });

    await mongoose.disconnect();

    console.log('Test database initialized');
}
