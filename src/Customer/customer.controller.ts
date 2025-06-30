import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import * as customerService from './customer.service';
import jwt from 'jsonwebtoken';
import { sendWelcomeEmail, sendVerificationEmail } from '../email/email.service';
import {
  getCustomersWithBookings,
  getCustomersWithReservation,
} from './customer.service';



export const handleGetCustomersWithBookings = async (_req: Request, res: Response) => {
  try {
    const result = await getCustomersWithBookings();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers with bookings.' });
  }
};

export const handleGetCustomersWithReservation = async (_req: Request, res: Response) => {
  try {
    const result = await getCustomersWithReservation();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers with reservation.' });
  }
};


// GET all customers (Admin only)
export const getAllCustomers = async (req: Request, res: Response) => {
    try {
        const customers = await customerService.getAll();
        res.status(200).json(customers);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// GET customer by ID (Admin )
export const getCustomerById = async (req: Request, res: Response) => {
    try {
        const requestedId = Number(req.params.id);
        const user = (req as any).user;
        
        // Allow admin to see any customer, or customer to see their own profile
        if (user.role !== 'admin' && user.user_id !== requestedId) {
            return res.status(403).json({ error: "Access denied" });
        }

        const customer = await customerService.getById(requestedId);
        if (!customer) {
            return res.status(404).json({ error: "Customer not found" });
        }
        
        // Remove password from response
        const { password, ...customerData } = customer;
        res.status(200).json(customerData);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// CREATE new customer (Registration)
export const createCustomer = async (req: Request, res: Response) => {
    try {
        const { password, ...customerData } = req.body;
        
        if (!password) {
            return res.status(400).json({ error: "Password is required" });
        }

        // Generate verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash password and set role
        const hashedPassword = bcrypt.hashSync(password, 10);
        const newCustomerData = {
            ...customerData,
            password: hashedPassword,
            role: 'customer',
            verificationCode: verificationCode,
            isVerified: false
        };

        const newCustomer = await customerService.create(newCustomerData);
        if (!newCustomer) {
            return res.status(400).json({ error: "Customer registration failed" });
        }

        // Send verification email
        const customerName = `${newCustomer.firstName} ${newCustomer.lastName}`;
        sendVerificationEmail(newCustomer.email, customerName, verificationCode)
            .then(() => console.log(`Verification email sent to ${newCustomer.email}`))
            .catch(err => console.error('Verification email send failed:', err.message));

        res.status(201).json({ 
            message: "Customer registered successfully. Please check your email for verification code.",
            customer: {
                customerID: newCustomer.customerID,
                firstName: newCustomer.firstName,
                lastName: newCustomer.lastName,
                email: newCustomer.email,
                role: newCustomer.role,
                isVerified: newCustomer.isVerified
            }
        });
    } catch (error: any) {
        if (error.message.includes('Email already exists')) {
            return res.status(400).json({ error: "Email already registered" });
        }
        res.status(500).json({ error: error.message });
    }
};

// Verify email with code
export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { email, verificationCode } = req.body;

        if (!email || !verificationCode) {
            return res.status(400).json({ error: "Email and verification code are required" });
        }

        const customer = await customerService.getByEmail(email);
        if (!customer) {
            return res.status(404).json({ error: "Customer not found" });
        }

        if (customer.isVerified) {
            return res.status(400).json({ error: "Email already verified" });
        }

        if (customer.verificationCode !== verificationCode) {
            return res.status(400).json({ error: "Invalid verification code" });
        }

        // Update customer as verified
        const updated = await customerService.update(customer.customerID, { 
            isVerified: true, 
            verificationCode: null 
        });

        if (updated) {
            // Send welcome email after verification
            const customerName = `${customer.firstName} ${customer.lastName}`;
            sendWelcomeEmail(customer.email, customerName)
                .then(() => console.log(`Welcome email sent to ${customer.email}`))
                .catch(err => console.error('Welcome email send failed:', err.message));
        }

        res.status(200).json({ 
            message: "Email verified successfully",
            customer: {
                customerID: updated?.customerID,
                firstName: updated?.firstName,
                lastName: updated?.lastName,
                email: updated?.email,
                role: updated?.role,
                isVerified: updated?.isVerified
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// CREATE admin (One-time setup - remove route after use)
export const createAdmin = async (req: Request, res: Response) => {
    try {
        const { password, ...adminData } = req.body;
        
        if (!password) {
            return res.status(400).json({ error: "Password is required" });
        }

        // Hash password and set role
        const hashedPassword = bcrypt.hashSync(password, 10);
        const newAdminData = {
            ...adminData,
            password: hashedPassword,
            role: 'admin',
            isVerified: true // Admin is verified by default
        };

        const newAdmin = await customerService.create(newAdminData);
        if (!newAdmin) {
            return res.status(400).json({ error: "Admin creation failed" });
        }

        // Send welcome email for admin too
        const adminName = `${newAdmin.firstName} ${newAdmin.lastName}`;
        sendWelcomeEmail(newAdmin.email, adminName)
            .then(() => console.log(`Welcome email sent to admin ${newAdmin.email}`))
            .catch(err => console.error('Admin email send failed:', err.message));

        res.status(201).json({ 
            message: "Admin created successfully",
            admin: {
                customerID: newAdmin.customerID,
                firstName: newAdmin.firstName,
                lastName: newAdmin.lastName,
                email: newAdmin.email,
                role: newAdmin.role,
                isVerified: newAdmin.isVerified
            }
        });
    } catch (error: any) {
        if (error.message.includes('Email already exists')) {
            return res.status(400).json({ error: "Email already registered" });
        }
        res.status(500).json({ error: error.message });
    }
};

// User login (works for both customers and admins)
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Check if user exists (customer or admin)
        const user = await customerService.getByEmail(email);
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Check if email is verified (except for admin)
        if (user.role !== 'admin' && !user.isVerified) {
            return res.status(401).json({ error: "Please verify your email before logging in" });
        }

        // Verify password
        const passwordMatch = bcrypt.compareSync(password, user.password as string);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Create JWT token
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET not configured");
        }

        const payload = {
            sub: user.customerID,
            user_id: user.customerID,
            first_name: user.firstName,
            last_name: user.lastName,
            email: user.email,
            role: user.role,
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 3) // 3 days
        };

        const token = jwt.sign(payload, secret);

        const responseMessage = user.role === 'admin' ? "Admin login successful" : "Customer login successful";
        const userKey = user.role === 'admin' ? "admin" : "customer";

        res.status(200).json({
            message: responseMessage,
            token,
            [userKey]: {
                customerID: user.customerID,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            }
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Legacy function for backward compatibility
export const loginCustomer = loginUser;

// UPDATE customer (Admin )
export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const customerId = Number(req.params.id);
        const user = (req as any).user;
        const updateData = { ...req.body };

        // Authorization check
        if (user.role !== 'admin' && user.user_id !== customerId) {
            return res.status(403).json({ error: "Access denied" });
        }

        // Hash password if being updated
        if (updateData.password) {
            updateData.password = bcrypt.hashSync(updateData.password, 10);
        }

        // Only admin can change roles and verification status
        if (user.role !== 'admin') {
            delete updateData.role;
            delete updateData.isVerified;
            delete updateData.verificationCode;
        }

        const updated = await customerService.update(customerId, updateData);
        if (!updated) {
            return res.status(404).json({ error: "Customer not found" });
        }

        // Remove password from response
        const { password, ...customerData } = updated;
        res.status(200).json({
            message: "Customer updated successfully",
            customer: customerData
        });
    } catch (error: any) {
        if (error.message.includes('Email already exists')) {
            return res.status(400).json({ error: "Email already in use" });
        }
        res.status(500).json({ error: error.message });
    }
};

// DELETE customer (Admin only)
export const deleteCustomer = async (req: Request, res: Response) => {
    try {
        const customerId = Number(req.params.id);
        const deleted = await customerService.remove(customerId);
        
        if (!deleted) {
            return res.status(404).json({ error: "Customer not found" });
        }

        res.status(200).json({ message: "Customer deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};