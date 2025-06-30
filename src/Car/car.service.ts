import db from '../Drizzle/db';
import { CarTable, LocationTable, BookingsTable } from '../Drizzle/schema';
import { eq, count, sum } from 'drizzle-orm';
import { InferInsertModel } from 'drizzle-orm';

type NewCar = InferInsertModel<typeof CarTable>;

// Gets all cars
export const getAll = async () => {
  return await db.select().from(CarTable);
};

// Gets a car by ID
export const getById = async (id: number) => {
  const result = await db.select().from(CarTable).where(eq(CarTable.carID, id));
  return result[0];
};

// Creates a new car
export const create = async (data: NewCar) => {
  // Ensure imageUrl is properly handled
  const carData = {
    ...data,
    imageUrl: data.imageUrl || '', // Default to empty string if no image
  };
  
  const result = await db.insert(CarTable).values(carData).returning();
  return result[0];
};

// Update an existing car
export const update = async (id: number, data: Partial<NewCar>) => {
  // Only update fields that are provided
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  );
  
  const result = await db
    .update(CarTable)
    .set(updateData)
    .where(eq(CarTable.carID, id))
    .returning();
  return result[0];
};

// Delete a car
export const remove = async (id: number) => {
  // First get the car to check if it has an image
  const car = await getById(id);
  
  // Delete the car from database
  await db.delete(CarTable).where(eq(CarTable.carID, id));
  
  // Optionally delete the image file from disk
  if (car?.imageUrl) {
    try {
      const fs = require('fs');
      const path = require('path');
      const imagePath = path.join(__dirname, '..', '..', 'uploads', path.basename(car.imageUrl));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log(`Deleted image file: ${imagePath}`);
      }
    } catch (error) {
      console.error('Error deleting image file:', error);
      // Don't throw error here, car deletion should succeed even if image deletion fails
    }
  }
};

// Get all cars with their location details
export const getAllCarsWithLocation = async () => {
  return await db
    .select({
      carID: CarTable.carID,
      carModel: CarTable.carModel,
      year: CarTable.year,
      color: CarTable.color,
      rentalRate: CarTable.rentalRate,
      availability: CarTable.availability,
      imageUrl: CarTable.imageUrl,
      location: {
        locationID: LocationTable.locationID,
        locationName: LocationTable.locationName,
        address: LocationTable.address,
        contactNumber: LocationTable.contactNumber
      }
    })
    .from(CarTable)
    .leftJoin(LocationTable as any, eq(CarTable.locationID, LocationTable.locationID));
};

// Get cars with their booking history and total revenue
export const getCarsWithBookingStats = async () => {
  return await db
    .select({
      carID: CarTable.carID,
      carModel: CarTable.carModel,
      year: CarTable.year,
      color: CarTable.color,
      rentalRate: CarTable.rentalRate,
      imageUrl: CarTable.imageUrl,
      location: {
        locationName: LocationTable.locationName
      },
      bookingCount: count(BookingsTable.bookingID).as('bookingCount'),
      totalRevenue: sum(BookingsTable.totalAmount).as('totalRevenue')
    })
    .from(CarTable)
    .leftJoin(LocationTable as any, eq(CarTable.locationID, LocationTable.locationID))
    .leftJoin(BookingsTable as any, eq(CarTable.carID, BookingsTable.carID))
    .groupBy(CarTable.carID, LocationTable.locationName);
};