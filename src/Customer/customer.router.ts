import { Express } from "express";
import { 
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    loginUser,
    createAdmin,
    verifyEmail,
    handleGetCustomersWithBookings,
  handleGetCustomersWithReservation,
 
} from "./customer.controller";
import { adminOnly, authenticated } from "../middleware/bearAuth";

const customerRoutes = (app: Express) => {
    
    
    
    // Customer registration
    app.post("/customers/register", async (req, res, next) => {
        try {
            await createCustomer(req, res);
        } catch (error) {
            next(error);
        }
    });

    // Email verification
    app.post("/customers/verify", async (req, res, next) => {
        try {
            await verifyEmail(req, res);
        } catch (error) {
            next(error);
        }
    });
    
 
    // admin/customer login endpoint (for backward compatibility)
    app.post("/customers/login", async (req, res, next) => {
        try {
            await loginUser(req, res);
        } catch (error) {
            next(error);
        }
    });
    
    // Admin creation 
    app.post("/admin/create", async (req, res, next) => {
        try {
            await createAdmin(req, res);
        } catch (error) {
            next(error);
        }
    });
    
    // Protected routes (authentication required)
    
    // Get all customers (Admin only)
    app.get("/customers", adminOnly, async (req, res, next) => {
        try {
            await getAllCustomers(req, res);
        } catch (error) {
            next(error);
        }
    });
        
    // Get customer by ID (Admin)
    app.get("/customers/:id", authenticated, async (req, res, next) => {
        try {
            await getCustomerById(req, res);
        } catch (error) {
            next(error);
        }
    });
    
    // Update customer (Admin)
    app.put("/customers/:id", authenticated, async (req, res, next) => {
        try {
            await updateCustomer(req, res);
        } catch (error) {
            next(error);
        }
    });
    
    // Delete customer (Admin only)
    app.delete("/customers/:id", adminOnly, async (req, res, next) => {
        try {
            await deleteCustomer(req, res);
        } catch (error) {
            next(error);
        }
    });
    // Additional customer-related routes
    app.get('/customers-with-bookings', handleGetCustomersWithBookings);
    app.get('/customers-with-reservation', handleGetCustomersWithReservation);
   
};

export default customerRoutes;