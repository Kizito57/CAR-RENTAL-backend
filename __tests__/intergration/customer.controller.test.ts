import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import * as customerService from '../../src/Customer/customer.service';
import * as customerControllerModule from '../../src/Customer/customer.controller';
import * as emailService from '../../src/email/email.service';
import jwt from 'jsonwebtoken';

jest.mock('../../src/Drizzle/db', () => ({
  client: {
    connect: jest.fn(),
    end: jest.fn(),
    query: jest.fn(),
  },
}));

jest.mock('../../src/Customer/customer.service');
jest.mock('../../src/email/email.service');
jest.mock('jsonwebtoken');

const customerController = {
  getAllCustomers: customerControllerModule.getAllCustomers as (req: Request, res: Response) => any,
  getCustomerById: customerControllerModule.getCustomerById as (req: Request, res: Response) => any,
  createCustomer: customerControllerModule.createCustomer as (req: Request, res: Response) => any,
  updateCustomer: customerControllerModule.updateCustomer as (req: Request, res: Response) => any,
  deleteCustomer: customerControllerModule.deleteCustomer as (req: Request, res: Response) => any,
  verifyEmail: customerControllerModule.verifyEmail as (req: Request, res: Response) => any,
  createAdmin: customerControllerModule.createAdmin as (req: Request, res: Response) => any,
  loginUser: customerControllerModule.loginUser as (req: Request, res: Response) => any,
  handleGetCustomersWithBookings: customerControllerModule.handleGetCustomersWithBookings as (req: Request, res: Response) => any,
  handleGetCustomersWithReservation: customerControllerModule.handleGetCustomersWithReservation as (req: Request, res: Response) => any,
};

const app = express();
app.use(express.json());

// Create different middleware for different test scenarios
const adminMiddleware = (req: Request & { user?: any }, _res: Response, next: NextFunction) => {
  req.user = { role: 'admin', user_id: 1 };
  next();
};

const customerMiddleware = (req: Request & { user?: any }, _res: Response, next: NextFunction) => {
  req.user = { role: 'customer', user_id: 1 };
  next();
};

const unauthorizedMiddleware = (req: Request & { user?: any }, _res: Response, next: NextFunction) => {
  req.user = { role: 'customer', user_id: 999 };
  next();
};

// Routes
app.get('/customers', adminMiddleware, customerController.getAllCustomers);
app.get('/customers/:id', customerController.getCustomerById);
app.post('/customers', customerController.createCustomer);
app.put('/customers/:id', customerController.updateCustomer);
app.delete('/customers/:id', adminMiddleware, customerController.deleteCustomer);
app.post('/verify-email', customerController.verifyEmail);
app.post('/admin', customerController.createAdmin);
app.post('/login', customerController.loginUser);
app.get('/customers-with-bookings', adminMiddleware, customerController.handleGetCustomersWithBookings);
app.get('/customers-with-reservations', adminMiddleware, customerController.handleGetCustomersWithReservation);

const mockCustomer = {
  customerID: 1,
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@gmail.com',
  password: 'hashedpassword',
  role: 'customer',
  isVerified: true,
  verificationCode: null,
};

const mockUnverifiedCustomer = {
  ...mockCustomer,
  customerID: 2,
  email: 'unverified@gmail.com',
  isVerified: false,
  verificationCode: '123456',
};

describe('Customer Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('GET /customers', () => {
    it('should return all customers', async () => {
      (customerService.getAll as jest.Mock).mockResolvedValue([mockCustomer]);
      const res = await request(app).get('/customers');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([mockCustomer]);
    });

    it('should handle service errors', async () => {
      (customerService.getAll as jest.Mock).mockRejectedValue(new Error('Database error'));
      const res = await request(app).get('/customers');
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Database error');
    });
  });

  describe('POST /customers', () => {
    beforeEach(() => {
      (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(true);
    });

    it('should create a new customer', async () => {
      (customerService.create as jest.Mock).mockResolvedValue(mockCustomer);
      const res = await request(app).post('/customers').send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@gmail.com',
        password: 'plainpassword',
      });
      expect(res.status).toBe(201);
      expect(res.body.customer.email).toBe(mockCustomer.email);
      expect(res.body.message).toContain('verification code');
    });

    it('should return error when password is missing', async () => {
      const res = await request(app).post('/customers').send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Password is required');
    });

    it('should handle duplicate email error', async () => {
      (customerService.create as jest.Mock).mockRejectedValue(new Error('Email already exists'));
      const res = await request(app).post('/customers').send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@gmail.com',
        password: 'plainpassword',
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email already registered');
    });
  });

  describe('POST /verify-email', () => {
    it('should verify email with correct code', async () => {
      (customerService.getByEmail as jest.Mock).mockResolvedValue(mockUnverifiedCustomer);
      (customerService.update as jest.Mock).mockResolvedValue({ ...mockUnverifiedCustomer, isVerified: true });
      (emailService.sendWelcomeEmail as jest.Mock).mockResolvedValue(true);

      const res = await request(app).post('/verify-email').send({
        email: 'unverified@gmail.com',
        verificationCode: '123456',
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Email verified successfully');
    });

    it('should return error for invalid verification code', async () => {
      (customerService.getByEmail as jest.Mock).mockResolvedValue(mockUnverifiedCustomer);

      const res = await request(app).post('/verify-email').send({
        email: 'unverified@gmail.com',
        verificationCode: 'wrong-code',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid verification code');
    });

    it('should return error when email is already verified', async () => {
      (customerService.getByEmail as jest.Mock).mockResolvedValue(mockCustomer);

      const res = await request(app).post('/verify-email').send({
        email: 'jane@gmail.com',
        verificationCode: '123456',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email already verified');
    });
  });

  describe('POST /login', () => {
    beforeEach(() => {
      (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');
    });

    it('should login verified customer successfully', async () => {
      (customerService.getByEmail as jest.Mock).mockResolvedValue(mockCustomer);
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

      const res = await request(app).post('/login').send({
        email: 'jane@gmail.com',
        password: 'plainpassword',
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Customer login successful');
      expect(res.body.token).toBe('mock-jwt-token');
      expect(res.body.customer).toBeDefined();
    });

    it('should login admin successfully', async () => {
      const adminUser = { ...mockCustomer, role: 'admin' };
      (customerService.getByEmail as jest.Mock).mockResolvedValue(adminUser);
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

      const res = await request(app).post('/login').send({
        email: 'admin@gmail.com',
        password: 'plainpassword',
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Admin login successful');
      expect(res.body.admin).toBeDefined();
    });

    it('should reject unverified customer login', async () => {
      (customerService.getByEmail as jest.Mock).mockResolvedValue(mockUnverifiedCustomer);

      const res = await request(app).post('/login').send({
        email: 'unverified@gmail.com',
        password: 'plainpassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Please verify your email before logging in');
    });

    it('should reject invalid credentials', async () => {
      (customerService.getByEmail as jest.Mock).mockResolvedValue(mockCustomer);
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

      const res = await request(app).post('/login').send({
        email: 'jane@gmail.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid email or password');
    });
  });

  describe('POST /admin', () => {
    it('should create admin successfully', async () => {
      const adminUser = { ...mockCustomer, role: 'admin' };
      (customerService.create as jest.Mock).mockResolvedValue(adminUser);
      (emailService.sendWelcomeEmail as jest.Mock).mockResolvedValue(true);

      const res = await request(app).post('/admin').send({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@gmail.com',
        password: 'adminpassword',
      });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Admin created successfully');
      expect(res.body.admin.role).toBe('admin');
      expect(res.body.admin.isVerified).toBe(true);
    });
  });

  describe('GET /customers/:id', () => {
    it('should return a customer by ID for admin', async () => {
      app.use('/test-admin', adminMiddleware);
      app.get('/test-admin/customers/:id', customerController.getCustomerById);

      (customerService.getById as jest.Mock).mockResolvedValue(mockCustomer);
      const res = await request(app).get('/test-admin/customers/1');
      expect(res.status).toBe(200);
      expect(res.body.email).toBe(mockCustomer.email);
      expect(res.body.password).toBeUndefined(); // Password should be removed
    });

    it('should allow customer to see their own profile', async () => {
      app.use('/test-customer', customerMiddleware);
      app.get('/test-customer/customers/:id', customerController.getCustomerById);

      (customerService.getById as jest.Mock).mockResolvedValue(mockCustomer);
      const res = await request(app).get('/test-customer/customers/1');
      expect(res.status).toBe(200);
      expect(res.body.email).toBe(mockCustomer.email);
    });

    it('should deny access to other customer profiles', async () => {
      app.use('/test-unauthorized', unauthorizedMiddleware);
      app.get('/test-unauthorized/customers/:id', customerController.getCustomerById);

      const res = await request(app).get('/test-unauthorized/customers/1');
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Access denied');
    });
  });

  describe('PUT /customers/:id', () => {
    it('should update a customer', async () => {
      app.use('/test-update', customerMiddleware);
      app.put('/test-update/customers/:id', customerController.updateCustomer);

      const updated = { ...mockCustomer, firstName: 'Updated' };
      (customerService.update as jest.Mock).mockResolvedValue(updated);
      const res = await request(app).put('/test-update/customers/1').send({ firstName: 'Updated' });
      expect(res.status).toBe(200);
      expect(res.body.customer.firstName).toBe('Updated');
    });

    it('should hash password when updating', async () => {
      app.use('/test-password', customerMiddleware);
      app.put('/test-password/customers/:id', customerController.updateCustomer);

      const updated = { ...mockCustomer, firstName: 'Updated' };
      (customerService.update as jest.Mock).mockResolvedValue(updated);
      
      const res = await request(app).put('/test-password/customers/1').send({ 
        firstName: 'Updated',
        password: 'newpassword'
      });
      
      expect(res.status).toBe(200);
      expect(customerService.update).toHaveBeenCalledWith(1, expect.objectContaining({
        firstName: 'Updated',
        password: expect.any(String) // Should be hashed
      }));
    });
  });

  describe('DELETE /customers/:id', () => {
    it('should delete a customer', async () => {
      (customerService.remove as jest.Mock).mockResolvedValue(true);
      const res = await request(app).delete('/customers/1');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Customer deleted successfully');
    });

    it('should return 404 when customer not found', async () => {
      (customerService.remove as jest.Mock).mockResolvedValue(false);
      const res = await request(app).delete('/customers/1');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Customer not found');
    });
  });

 

  describe('Error handling', () => {
    it('should handle missing JWT_SECRET', async () => {
      delete process.env.JWT_SECRET;
      (customerService.getByEmail as jest.Mock).mockResolvedValue(mockCustomer);
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

      const res = await request(app).post('/login').send({
        email: 'jane@gmail.com',
        password: 'plainpassword',
      });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('JWT_SECRET not configured');
    });
  });
});