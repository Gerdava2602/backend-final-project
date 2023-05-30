import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index';
import Product from "../models/Product";
import User from "../models/User";
import * as jwt from '../utils/jwt';
import {
    getProducts,
    getProduct,
    userCategories,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/product';

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI ?? '');
    await Product.deleteMany({});
});

describe('Product', () => {
    describe('POST /', () => {
        describe('Endpoint tests', () => {
            it('Endpoint should create a new product', async () => {
                const token = jwt.generateToken({ email: 'test@email.com', password: 'test' });
                const response = await request(app).post('/product').set('Cookie', `token=${token}`).send({
                    name: 'test',
                    price: 10,
                    description: 'test',
                    image: 'test',
                    category: 'test',
                });
                
                expect(response.status).toBe(201);
                expect(response.body).toHaveProperty('_id');
            });

            it('Endpoint should return 500 if name is missing', async () => {
                const token = jwt.generateToken({ email: 'test@email.com', password: 'test' });
                const response = await request(app).post('/product').set('Cookie', `token=${token}`).send({
                    price: 10,
                    description: 'test',
                    image: 'test',
                    category: 'test',
                });

                expect(response.status).toBe(500);
            });
        });

        describe('Controller tests', () => {
            it('Controller should create a new user', async () => {
                const mockRequest = {
                    body: {
                        name: 'test',
                        price: 10,
                        description: 'test',
                        image: 'test',
                        category: 'test',
                    },
                    user: {
                        email: 'test@email.com',
                    },
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                } as any;

                const mockNext = jest.fn();

                const mockCreate = jest.spyOn(Product, 'create');
                await createProduct(mockRequest, mockResponse, mockNext);

                expect(mockCreate).toHaveBeenCalledWith({ ...mockRequest.body, user: expect.any(mongoose.Types.ObjectId) });

                expect(mockResponse.status).toHaveBeenCalledWith(201);
                expect(mockResponse.json).toHaveBeenCalled();
            });

            it('Controller not create a user if there is an error', async () => {
                const mockRequest = {
                    body: {
                        name: 'test',
                        price: 10,
                        description: 'test',
                        image: 'test',
                        category: 'test',
                    },
                    user: {
                        email: 'test@email.com',
                    },
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                } as any;

                const mockNext = jest.fn();

                const mockCreate = jest.spyOn(Product, 'create');
                const mockError = new Error('Failed to create user');
                mockCreate.mockRejectedValueOnce(mockError);

                await createProduct(mockRequest, mockResponse, mockNext);

                expect(mockResponse.status).not.toHaveBeenCalled();
            });
        });
    });

    describe('GET /id', () => {
        describe('Endpoint tests', () => {
            it('Endpoint should return a product', async () => {
                const product = await Product.findOne({ name: 'test' });
                const response = await request(app).get(`/product/${product?._id}`);
                expect(response.status).toBe(200);
            });

            it('Endpoint should return 404 if product is not in db', async () => {
                const response = await request(app).get(`/product/6473c8e85bfbf596501284a9`);
                expect(response.status).toBe(404);
            });
        });

        describe('Controller tests', () => {
            it('Controller should return a product', async () => {
                const product = await Product.findOne({ name: 'test' });
                const mockRequest = {
                    params: {
                        id: product?._id,
                    },
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                } as any;

                const mockNext = jest.fn();

                const mockFindOne = jest.spyOn(Product, 'findOne');
                mockFindOne.mockResolvedValueOnce(mockRequest.params.id);

                await getProduct(mockRequest, mockResponse, mockNext);

                expect(mockFindOne).toHaveBeenCalledWith({ _id: mockRequest.params.id, active: true });
                expect(mockResponse.status).toHaveBeenCalledWith(200);
            });

            it('Controller should not return a product if there is no product with that id', async () => {
                const mockRequest = {
                    params: {
                        id: '6473c8e85bfbf596501384a9',
                    },
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                } as any;

                const mockNext = jest.fn();
                
                const mockFindOne = jest.spyOn(Product, 'findOne');
                mockFindOne.mockResolvedValueOnce(null);

                await getProduct(mockRequest, mockResponse, mockNext);

                expect(mockFindOne).toHaveBeenCalledWith({ _id: new mongoose.Types.ObjectId(mockRequest.params.id), active: true });
                expect(mockNext).toHaveBeenCalled();
            });
        });
    });

    describe('GET / Categories', () => {
        describe('Endpoint tests', () => {
            it('Endpoint should return a product', async () => {
                const user = await User.findOne({ username: 'test' });
                const response = await request(app).get(`/product/categories/${user?._id}`);
                expect(response.status).toBe(200);
            });

            it('Endpoint should return 404 if user is not in db', async () => {
                const response = await request(app).get(`/product/categories/6473c8e85bfbf596501284a9`);
                expect(response.status).toBe(404);
            });
        });

        describe('Controller tests', () => {
            it('Controller should return a category', async () => {
                const user = await User.findOne({ username: 'test' });
                const mockRequest = {
                    params: {
                        id: user?._id,
                    },
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                } as any;

                const mockNext = jest.fn();

                const mockFindOne = jest.spyOn(User, 'findOne');
                mockFindOne.mockResolvedValueOnce(mockRequest.params.id);

                await userCategories(mockRequest, mockResponse, mockNext);

                expect(mockFindOne).toHaveBeenCalledWith({ _id: mockRequest.params.id, active: true }, { password: 0 });
                expect(mockResponse.status).toHaveBeenCalledWith(200);
            });

            it('Controller should not return a category if there is no user with that id', async () => {
                const mockRequest = {
                    params: {
                        id: '6473c8e85bfbf596501384a9',
                    },
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                } as any;

                const mockNext = jest.fn();
                
                const mockFindOne = jest.spyOn(User, 'findOne');
                mockFindOne.mockResolvedValueOnce(null);

                await userCategories(mockRequest, mockResponse, mockNext);

                expect(mockFindOne).toHaveBeenCalledWith({ _id: new mongoose.Types.ObjectId(mockRequest.params.id), active: true }, { password: 0 });
                expect(mockNext).toHaveBeenCalled();
            });
        });
    });

    describe('GET / Search', () => {
        describe('Endpoint tests', () => {
            it('Endpoint should return products when searching by name', async () => {
                const response = await request(app).get(`/product?name=test`);
                expect(response.status).toBe(200);
            });

            it('Endpoint should return 404 if user is not in db', async () => {
                const response = await request(app).get(`/product?userId=653457893457`);
                expect(response.status).toBe(404);
            });
        });

        describe('Controller tests', () => {
            it('Controller should return products by name', async () => {
                const mockRequest = {
                    query: {
                        name: 'test',
                    },
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                } as any;

                const mockNext = jest.fn();

                const mockAggregate = jest.spyOn(Product, 'aggregate');
                mockAggregate.mockResolvedValueOnce(mockRequest.query.name);

                await getProducts(mockRequest, mockResponse, mockNext);

                expect(mockAggregate).toHaveBeenCalledWith([
                    {
                        $match: {
                            name: {
                                $regex: mockRequest.query.name,
                                $options: 'i',
                            },
                            active: true,
                        },
                    },
                ]);
                expect(mockResponse.status).toHaveBeenCalledWith(200);
                
            });

            it('Controller should return 404 if user does not exist', async () => {
                const mockRequest = {
                    query: {
                        userId: '6473c8e85bfbf596501184a9',
                    },
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                } as any;

                const mockNext = jest.fn();

                await getProducts(mockRequest, mockResponse, mockNext);

                expect(mockNext).toHaveBeenCalled();
            });

        });
    });

    describe('PUT /', () => {
        describe('Endpoint tests', () => {
            it('Endpoint should update a product', async () => {
                const token = jwt.generateToken({ email: 'test@email.com', password: 'test' });
                const product = await Product.findOne({ name: 'test' });

                const response = await request(app).put(`/product/${product?._id}`).set('Cookie', `token=${token}`).send({
                    name: 'testEdited',
                });
                expect(response.status).toBe(200);
            });

            it('Endpoint should return 404 if product is not in db', async () => {
                const token = jwt.generateToken({ email: 'test@email.com', password: 'test' });

                const response = await request(app).put(`/product/6473c8e85bfbf596501284a9`).set('Cookie', `token=${token}`).send({
                    name: 'testEdited',
                });

                expect(response.status).toBe(404);
            });
        });

        describe('Controller tests', () => {
            it('Controller should update a product', async () => {
                const product = await Product.findOne({ name: 'test' });
                const user = await User.findOne({ username: 'test' });

                const mockRequest = {
                    params: {
                        id: product?._id.toString(),
                    },
                    body: {
                        name: 'testEdited2',
                    },
                    user: {
                        email: user?.email,
                    },
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                } as any;

                const mockNext = jest.fn();

                const mockFindOne = jest.spyOn(Product, 'findOne');
                mockFindOne.mockResolvedValueOnce(product);

                const mockUpdateOne = jest.spyOn(Product, 'updateOne');
                mockUpdateOne.mockResolvedValueOnce(mockRequest.body);

                await updateProduct(mockRequest, mockResponse, mockNext);

                expect(mockFindOne).toHaveBeenCalledWith({ _id: product?._id, active: true });
                expect(mockUpdateOne).toHaveBeenCalledWith(
                    {
                        _id: new mongoose.Types.ObjectId(mockRequest.params.id),
                        active: true,
                    },
                    {
                        name: mockRequest.body.name,
                    },
                    { new: true }
                );

                expect(mockResponse.status).toHaveBeenCalledWith(200);
            });

            it('Controller should not update a product if there is no product with that id', async () => {
                const user = await User.findOne({ username: 'test' });

                const mockRequest = {
                    params: {
                        id: '6473c8e85bfbf596501284a9',
                    },
                    body: {
                        name: 'testEdited2',
                    },
                    user: {
                        email: user?.email,
                    },
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                } as any;

                const mockNext = jest.fn();

                const mockFindOne = jest.spyOn(Product, 'findOne');
                mockFindOne.mockResolvedValueOnce(null);

                await updateProduct(mockRequest, mockResponse, mockNext);

                expect(mockFindOne).toHaveBeenCalledWith({ _id: new mongoose.Types.ObjectId(mockRequest.params.id), active: true });
                expect(mockNext).toHaveBeenCalled();

                expect(mockResponse.status).not.toHaveBeenCalled();
            });
        });
    });

    describe('DELETE /', () => {
        describe('Endpoint tests', () => {
            it('Endpoint should delete a product', async () => {
                const product = await Product.findOne();
                const token = jwt.generateToken({ email: 'test@email.com', password: 'test' });

                const response = await request(app).delete(`/product/${product?._id}`).set('Cookie', `token=${token}`);
                expect(response.status).toBe(200);
            });

            it('Endpoint should return 404 if product is not in db', async () => {
                const token = jwt.generateToken({ email: 'test@email.com', password: 'test' });

                const response = await request(app).delete(`/product/6473c8e85bfbf596501284a9`).set('Cookie', `token=${token}`);
                expect(response.status).toBe(404);
            });
        });

        describe('Controller tests', () => {
            it('Controller should delete a product', async () => {
                const product = await Product.findOne({ active: true });
                const user = await User.findOne({ username: 'test' });

                const mockRequest = {
                    params: {
                        id: product?._id,
                    },
                    user: {
                        email: user?.email,
                    },
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                } as any;
                
                const mockNext = jest.fn();


                const mockFindOneAndUpdate = jest.spyOn(Product, 'findOneAndUpdate');
                mockFindOneAndUpdate.mockResolvedValueOnce(product);


                await deleteProduct(mockRequest, mockResponse, mockNext);

                expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
                    {
                        _id: new mongoose.Types.ObjectId(mockRequest.params.id),
                        active: true,
                    },
                    {
                        active: false,
                    },
                    { new: true }
                );
                expect(mockResponse.status).toHaveBeenCalledWith(200);
            });

            it('Controller should not delete a product if there is no product with that id', async () => {
                const user = await User.findOne({ username: 'test' });

                const mockRequest = {
                    params: {
                        id: '6473c8e85bfbf596501284a9',
                    },
                    user: {
                        email: user?.email,
                    },
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                } as any;

                const mockNext = jest.fn();

                const mockFindOne = jest.spyOn(Product, 'findOne');
                mockFindOne.mockResolvedValueOnce(null);

                await deleteProduct(mockRequest, mockResponse, mockNext);

                expect(mockFindOne).toHaveBeenCalledWith({ _id: new mongoose.Types.ObjectId(mockRequest.params.id), active: true });

                expect(mockNext).toHaveBeenCalled();
                expect(mockResponse.status).not.toHaveBeenCalled();
            });
        });
    });
});

afterAll(async () => {
    await mongoose.disconnect();
});