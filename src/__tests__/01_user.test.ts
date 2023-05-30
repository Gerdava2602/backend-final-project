import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index';
import User from "../models/User";
import * as jwt from '../utils/jwt';
import { signup, login, getUser, updateUser, deleteUser } from '../controllers/user';

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI ?? '');
    await User.deleteMany({});
});

describe('User', () => {
    describe('POST /signup', () => {
        describe('Endpoint tests', () => {
            it('Endpoint should create a new user', async () => {
                const response = await request(app).post('/user/signup').send({
                    username: 'test',
                    email: 'test@email.com',
                    password: 'test',
                    name: 'test',
                    lastname: 'test',
                    phone: 'test',
                    address: 'test'
                });
                expect(response.status).toBe(201);
            });

            it('Endpoint should return 500 if username is missing', async () => {
                const response = await request(app).post('/user/signup').send({
                    email: 'test@email.com',
                    password: 'test',
                    name: 'test',
                    lastname: 'test',
                    phone: 'test',
                    address: 'test'
                });
                expect(response.status).toBe(500);
            });
        });

        describe('Controller tests', () => {
            it('Controller should create a new user', async () => {
                const mockRequest = {
                    body: {
                        username: 'testuser',
                        email: 'test@example.com',
                        password: 'testpassword',
                        name: 'John',
                        lastname: 'Doe',
                        phone: '1234567890',
                        address: '123 Main St',
                    },
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                } as any;

                const mockNext = jest.fn();

                const mockCreate = jest.spyOn(User, 'create');
                mockCreate.mockResolvedValueOnce(mockRequest.body);

                const mockHashPassword = jest.spyOn(jwt, 'hashPassword');
                mockHashPassword.mockResolvedValueOnce('testpassword');

                await signup(mockRequest, mockResponse, mockNext);

                expect(mockCreate).toHaveBeenCalledWith({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'testpassword',
                    name: 'John',
                    lastname: 'Doe',
                    phone: '1234567890',
                    address: '123 Main St',
                });

                expect(mockHashPassword).toHaveBeenCalledWith('testpassword');

                expect(mockResponse.status).toHaveBeenCalledWith(201);
                expect(mockResponse.json).toHaveBeenCalledWith(mockRequest.body);
            });

            it('Controller not create a user if there is an error', async () => {
                const mockRequest = {
                    body: {
                        username: 'testuser',
                        email: 'test@example.com',
                        password: 'testpassword',
                        name: 'John',
                        lastname: 'Doe',
                        phone: '1234567890',
                        address: '123 Main St',
                    },
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                } as any;

                const mockNext = jest.fn();

                const mockCreate = jest.spyOn(User, 'create');
                const mockError = new Error('Failed to create user');
                mockCreate.mockRejectedValueOnce(mockError);

                await signup(mockRequest, mockResponse, mockNext);

                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
            });
        });
    });

    describe('POST /login', () => {
        describe('Endpoint tests', () => {
            it('Endpoint should login a user', async () => {
                const response = await request(app).post('/user/login').send({
                    email: 'test@email.com',
                    password: 'test'
                });
                expect(response.status).toBe(200);
            });

            it('Endpoint should return 404 if username is not in db', async () => {
                const response = await request(app).post('/user/login').send({
                    email: 'test2@email.com',
                    password: 'test'
                });
                expect(response.status).toBe(404);
            });
        });

        describe('Controller tests', () => {
            it('Controller should login a user', async () => {
                const mockRequest = {
                    body: {
                        email: 'test@email.com',
                        password: 'test'
                    },
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                    cookie: jest.fn()
                } as any;

                const mockNext = jest.fn();

                const mockFindOne = jest.spyOn(User, 'findOne');
                mockFindOne.mockResolvedValueOnce(mockRequest.body);

                const mockComparePassword = jest.spyOn(jwt, 'comparePassword');
                mockComparePassword.mockResolvedValueOnce(true);

                await login(mockRequest, mockResponse, mockNext);

                expect(mockFindOne).toHaveBeenCalledWith({ email: mockRequest.body.email, active: true });
                expect(mockComparePassword).toHaveBeenCalledWith(mockRequest.body.password, mockRequest.body.password);

                expect(mockResponse.cookie).toHaveBeenCalled();
            });

            it('Controller should not login a user if the password doesnt match', async () => {
                const mockRequest = {
                    body: {
                        email: 'test@email.com',
                        password: 'falcao'
                    },
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                    cookie: jest.fn()
                } as any;

                const mockNext = jest.fn();

                const mockFindOne = jest.spyOn(User, 'findOne');
                mockFindOne.mockResolvedValueOnce(mockRequest.body);

                const mockComparePassword = jest.spyOn(jwt, 'comparePassword');
                mockComparePassword.mockResolvedValueOnce(false);

                await login(mockRequest, mockResponse, mockNext);

                expect(mockFindOne).toHaveBeenCalledWith({ email: mockRequest.body.email, active: true });
                expect(mockComparePassword).toHaveBeenCalledWith(mockRequest.body.password, mockRequest.body.password);

                expect(mockResponse.cookie).not.toHaveBeenCalled();
            });
        });
    });

    describe('GET /id', () => {
        describe('Endpoint tests', () => {
            it('Endpoint should return a user', async () => {
                const user = await User.findOne({ username: 'test' });
                const response = await request(app).get(`/user/${user?._id}`);
                expect(response.status).toBe(200);
            });

            it('Endpoint should return 404 if user is not in db', async () => {
                const response = await request(app).get(`/user/6473c8e85bfbf596501284a9`);
                expect(response.status).toBe(404);
            });
        });

        describe('Controller tests', () => {
            it('Controller should return a user', async () => {
                const user = await User.findOne({ username: 'test' });
                const mockRequest = {
                    params: {
                        id: user?._id
                    },
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                } as any;

                const mockNext = jest.fn();

                const mockFindOne = jest.spyOn(User, 'findOne');
                mockFindOne.mockResolvedValueOnce(mockRequest.params.id);

                await getUser(mockRequest, mockResponse, mockNext);

                expect(mockFindOne).toHaveBeenCalledWith({ _id: mockRequest.params.id, active: true }, { password: 0 });

                expect(mockResponse.status).toHaveBeenCalledWith(200);
                expect(mockResponse.json).toHaveBeenCalledWith(mockRequest.params.id);
            });

            it('Controller should not return a user if there is no user with that id', async () => {
                const mockRequest = {
                    params: {
                        id: '6473cab65737444e478d4bae'
                    },
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                } as any;

                const mockNext = jest.fn();

                const mockFindOne = jest.spyOn(User, 'findOne');
                mockFindOne.mockResolvedValueOnce(null);

                await getUser(mockRequest, mockResponse, mockNext);

                expect(mockFindOne).toHaveBeenCalledWith({ _id: mockRequest.params.id, active: true }, { password: 0 });
                expect(mockNext).toHaveBeenCalled();
            });
        });
    });

    describe('PUT /id', () => {
        describe('Endpoint tests', () => {
            it('Endpoint should update a user', async () => {
                const token = jwt.generateToken({ email: 'test@email.com', password: 'test'});

                const user = await User.findOne({ username: 'test' });
                const response = await request(app).put(`/user/${user?._id}`).set('Cookie', `token=${token}`).send({
                    address: 'test2',
                });

                expect(response.status).toBe(200);
            });

            it('Endpoint should return 401 if user is not logged in', async () => {
                const user = await User.findOne({ username: 'test' });
                const response = await request(app).put(`/user/${user?._id}`).send({
                    address: 'test2',
                });

                expect(response.status).toBe(401);
            });
        });

        describe('Controller tests', () => {
            it('Controller should update a user', async () => {
                const user = await User.findOne({ username: 'test' });
                const mockRequest = {
                    params: {
                        id: user?._id
                    },
                    body: {
                        address: 'test2'
                    }
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                } as any;

                const mockNext = jest.fn();

                const mockFindOne = jest.spyOn(User, 'findOne');
                mockFindOne.mockResolvedValueOnce(mockRequest.params.id);

                const mockUpdateOne = jest.spyOn(User, 'updateOne');
                mockUpdateOne.mockResolvedValueOnce(mockRequest.body);

                await updateUser(mockRequest, mockResponse, mockNext);

                expect(mockFindOne).toHaveBeenCalledWith({ _id: mockRequest.params.id, active: true });
                expect(mockUpdateOne).toHaveBeenCalledWith({ _id: mockRequest.params.id, active: true }, mockRequest.body, { new: true });

                expect(mockResponse.status).toHaveBeenCalledWith(200);
                expect(mockResponse.json).toHaveBeenCalledWith('User updated successfully');
            });

            it('Controller should not update a user if there is no user with that id', async () => {
                const mockRequest = {
                    params: {
                        id: '6473cab65737444e478d4bae'
                    },
                    body: {
                        address: 'test2'
                    }
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                } as any;

                const mockNext = jest.fn();

                const mockFindOne = jest.spyOn(User, 'findOne');
                mockFindOne.mockResolvedValueOnce(null);

                await updateUser(mockRequest, mockResponse, mockNext);

                expect(mockFindOne).toHaveBeenCalledWith({ _id: mockRequest.params.id, active: true });
                expect(mockNext).toHaveBeenCalled();
            });
        });
    });

    describe('DELETE /id', () => {
        describe('Endpoint tests', () => {
            it('Endpoint should delete a user', async () => {
                const token = jwt.generateToken({ email: 'no2@mail.com', password: 'test'});

                const user = await User.create({
                    username: 'test2',
                    email: 'no2@mail.com',
                    password: 'test',
                    name: 'test',
                    lastname: 'test',
                    phone: 'test',
                    address: 'test'
                });

                const response = await request(app).delete(`/user/${user?._id}`).set('Cookie', `token=${token}`);
                expect(response.status).toBe(200);
            });

            it('Endpoint should return 404 if user is not in db', async () => {
                const token = jwt.generateToken({ email: 'test@email.com', password: 'test'});

                const response = await request(app).delete(`/user/6473c8e85bfbf596501284a9`).set('Cookie', `token=${token}`);
                expect(response.status).toBe(404);
            });
        });

        describe('Controller tests', () => {
            it('Controller should delete a user', async () => {
                const user = await User.findOne({ username: 'test' });
                const mockRequest = {
                    params: {
                        id: user?._id
                    },
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                } as any;

                const mockNext = jest.fn();

                const mockFindOne = jest.spyOn(User, 'findOne');
                mockFindOne.mockResolvedValueOnce(mockRequest.params.id);

                const mockUpdateOne = jest.spyOn(User, 'updateOne');
                mockUpdateOne.mockResolvedValueOnce(mockRequest.params.id);

                await deleteUser(mockRequest, mockResponse, mockNext);

                expect(mockFindOne).toHaveBeenCalledWith({ _id: mockRequest.params.id, active: true });
                expect(mockUpdateOne).toHaveBeenCalledWith({ _id: mockRequest.params.id, active: true }, { active: false });

                expect(mockResponse.status).toHaveBeenCalledWith(200);
                expect(mockResponse.json).toHaveBeenCalledWith('User deleted successfully');
            });

            it('Controller should not delete a user if there is no user with that id', async () => {
                const mockRequest = {
                    params: {
                        id: '6473cab65737444e478d4bae'
                    },
                } as any;

                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                } as any;

                const mockNext = jest.fn();

                const mockFindOne = jest.spyOn(User, 'findOne');
                mockFindOne.mockResolvedValueOnce(null);

                await deleteUser(mockRequest, mockResponse, mockNext);

                expect(mockFindOne).toHaveBeenCalledWith({ _id: mockRequest.params.id, active: true });
                expect(mockNext).toHaveBeenCalledWith({ status: 404, message: 'User not found' });
            });
        });
    });
});

afterAll(async () => {
    await mongoose.disconnect();
});