import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index';

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI ?? '');
});

describe('User', () => {

    
    describe('SIGNUP', () => {

        it('should create a new user', async () => {
            //fields are username, email, password, name, lastname, phone, address
            const response = await request(app).post('/user').send({
                username: 'test',
                email: 'test@email.com',
                password: 'test',
                name: 'test',
                lastname: 'test',
                phone: 'test',
                address: 'test'
            });
            // log the request response
            console.log(response.body);
        });

    });

});

afterAll(async () => {
    await mongoose.disconnect();
});