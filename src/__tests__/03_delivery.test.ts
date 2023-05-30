import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index';
import Product from "../models/Product";
import User from "../models/User";
import Delivery from '../models/Delivery';
import * as jwt from '../utils/jwt';
import {
    createDelivery,
    getDeliveries, 
    getDelivery, 
    updateDelivery
} from '../controllers/Delivery';

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI ?? '');
    await Delivery.deleteMany({});
});

describe('Product', () => {
    describe('POST /', () => {
        describe('Endpoint tests', () => {
            it('Endpoint should create a new delivery', async () => {
                const product = await Product.findOne({ active: true });
                const user = await User.findOne({ username: 'test' });

                if(!user) throw new Error('User not found');

                const token = jwt.generateToken({ email: user.email, password: user.password });

                const response = await request(app)
                    .post('/delivery')
                    .set('Cookie', `token=${token}`)
                    .send({
                        product: product?._id,
                        quantity: 1,
                        date: new Date(),
                        status: 'pending',
                        comments: 'test',
                        score: 5
                    });
                
                expect(response.status).toBe(201);
            });

            it('Endpoint should return 401 if user is not logged in', async () => {
                const product = await Product.findOne({ active: true });
                const user = await User.findOne({ username: 'test' });

                if (!user) throw new Error('User not found');

                const response = await request(app)
                    .post('/delivery')
                    .send({
                        user: user._id,
                        product: product?._id,
                        quantity: 1,
                        date: new Date(),
                        status: 'pending',
                        comments: 'test',
                        score: 5
                    });

                expect(response.status).toBe(401);
            });
        });

        describe('Controller tests', () => {
            it('Controller should create a new delivery', async () => {
                const product = await Product.findOne({ active: true });

                const mockRequest = {
                    body: {
                        product: product?._id,
                        quantity: 1,
                        date: new Date(),
                        status: 'pending',
                        comments: 'test',
                        score: 5
                    },
                    user: {
                        email: 'test@email.com',
                    }
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis()
                } as any;

                const mockNext = jest.fn();

                await createDelivery(mockRequest, mockResponse, mockNext);

                expect(mockResponse.status).toHaveBeenCalledWith(201);
            });

            it('Controller should return 404 if user is not found', async () => {
                const product = await Product.findOne({ active: true });

                const mockRequest = {
                    body: {
                        product: product?._id,
                        quantity: 1,
                        date: new Date(),
                        status: 'pending',
                        comments: 'test',
                        score: 5
                    },
                    user: {
                        email: 'testaaaa@email.com',
                    }
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis()
                } as any;

                const mockNext = jest.fn();

                await createDelivery(mockRequest, mockResponse, mockNext);

                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockNext).toHaveBeenCalled();
            });
        });
    });

    describe('GET / ID', () => {
        describe('Endpoint tests', () => {
            it('Endpoint should return a delivery', async () => {
                const delivery = await Delivery.findOne({});

                const user = await User.findOne({ username: 'test' });

                if (!user) throw new Error('User not found');

                const token = jwt.generateToken({ email: user.email, password: user.password });

                const response = await request(app)
                    .get(`/delivery/${delivery?._id}`)
                    .set('Cookie', `token=${token}`);
                
                expect(response.status).toBe(200);
            });

            it('Endpoint should return 401 if user is not logged in', async () => {
                const delivery = await Delivery.findOne({});

                const response = await request(app)
                    .get(`/delivery/${delivery?._id}`);

                expect(response.status).toBe(401);
            });
        });

        describe('Controller tests', () => {
            it('Controller should return a delivery', async () => {
                const delivery = await Delivery.findOne({});

                const mockRequest = {
                    params: {
                        id: delivery?._id
                    },
                    user: {
                        email: 'test@email.com',
                    }
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis()
                } as any;

                const mockNext = jest.fn();

                await getDelivery(mockRequest, mockResponse, mockNext);

                expect(mockResponse.status).toHaveBeenCalledWith(200);
            });

            it('Controller should return 404 if delivery is not found', async () => {
                const mockRequest = {
                    params: {
                        id: '5f7f5e3c9c4b3c2f9c0c9e7b'
                    },
                    user: {
                        email: 'test@email.com',
                    }
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis()
                } as any;

                const mockNext = jest.fn();

                await getDelivery(mockRequest, mockResponse, mockNext);

                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockNext).toHaveBeenCalled();
            });
        });
    });

    describe('GET / QUERY', () => {
        describe('Endpoint tests', () => {
            it('Endpoint should return deliveries', async () => {
                const user = await User.findOne({ username: 'test' });

                if (!user) throw new Error('User not found');

                const token = jwt.generateToken({ email: user.email, password: user.password });

                const response = await request(app)
                    .get(`/delivery`)
                    .set('Cookie', `token=${token}`);
                
                expect(response.status).toBe(200);
            });

            it('Endpoint should return 401 if user is not logged in', async () => {
                const response = await request(app)
                    .get(`/delivery`);

                expect(response.status).toBe(401);
            });
        });

        describe('Controller tests', () => {
            it('Controller should return deliveries', async () => {
                const mockRequest = {
                    user: {
                        email: 'test@email.com',
                    }
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis()
                } as any;

                const mockNext = jest.fn();

                await getDeliveries(mockRequest, mockResponse, mockNext);

                expect(mockResponse.status).toHaveBeenCalledWith(200);
            });

            it('Controller should return 404 if user is not found', async () => {
                const mockRequest = {
                    user: {
                        email: 'woiefjiowe@foiewi.com',
                    }
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis()
                } as any;

                const mockNext = jest.fn();

                await getDeliveries(mockRequest, mockResponse, mockNext);

                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockNext).toHaveBeenCalled();
            });
        });
    });

    describe('PUT / ID', () => {
        describe('Endpoint tests', () => {
            it('Endpoint should update a delivery', async () => {
                const delivery = await Delivery.findOne({});

                const user = await User.findOne({ username: 'test' });

                if (!user) throw new Error('User not found');

                const token = jwt.generateToken({ email: user.email, password: user.password });

                const response = await request(app)
                    .put(`/delivery/${delivery?._id}`)
                    .set('Cookie', `token=${token}`)
                    .send({
                        status: 'delivered',
                        comments: 'test',
                        score: 5
                    });
                
                expect(response.status).toBe(200);
            });

            it('Endpoint should return 401 if user is not logged in', async () => {
                const delivery = await Delivery.findOne({});

                const response = await request(app)
                    .put(`/delivery/${delivery?._id}`)
                    .send({
                        status: 'delivered',
                        comments: 'test',
                        score: 5
                    });

                expect(response.status).toBe(401);
            });
        });

        describe('Controller tests', () => {
            it('Controller should update a delivery', async () => {
                const delivery = await Delivery.findOne({});

                const mockRequest = {
                    params: {
                        id: delivery?._id
                    },
                    body: {
                        status: 'delivered',
                        comments: 'test',
                        score: 5
                    },
                    user: {
                        email: 'test@email.com'
                    }
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis()
                } as any;

                const mockNext = jest.fn();

                await updateDelivery(mockRequest, mockResponse, mockNext);

                expect(mockResponse.status).toHaveBeenCalledWith(200);
            });

            it('Controller should return 404 if delivery is not found', async () => {
                const mockRequest = {
                    params: {
                        id: '5f7f5e3c9c4b3c2f9c0c9e7b'
                    },
                    body: {
                        status: 'delivered',
                        comments: 'test',
                        score: 5
                    },
                    user: {
                        email: 'test@email.com'
                    }
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis()
                } as any;

                const mockNext = jest.fn();

                await updateDelivery(mockRequest, mockResponse, mockNext);

                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockNext).toHaveBeenCalled();
            });
        });
    });
});

afterAll(async () => {
    await mongoose.disconnect();
});