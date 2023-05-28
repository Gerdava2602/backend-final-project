import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index';
import User from "../models/User";
import * as jwt from '../utils/jwt';
import { signup } from '../controllers/user';

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
});

afterAll(async () => {
    await mongoose.disconnect();
});