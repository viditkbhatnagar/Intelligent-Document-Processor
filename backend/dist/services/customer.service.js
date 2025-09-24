"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const Customer_1 = require("../models/Customer");
class CustomerService {
    /**
     * Create a new customer
     */
    async createCustomer(customerData, createdBy) {
        try {
            const customer = new Customer_1.CustomerModel({
                ...customerData,
                createdBy
            });
            return await customer.save();
        }
        catch (error) {
            console.error('Error creating customer:', error);
            throw new Error('Failed to create customer');
        }
    }
    /**
     * Get all active customers for dropdown
     */
    async getActiveCustomers(createdBy) {
        try {
            const query = { isActive: true };
            if (createdBy) {
                query.createdBy = createdBy;
            }
            return await Customer_1.CustomerModel.find(query)
                .sort({ name: 1 })
                .select('name address contact email country currency')
                .exec();
        }
        catch (error) {
            console.error('Error fetching customers:', error);
            throw new Error('Failed to fetch customers');
        }
    }
    /**
     * Get customer by ID
     */
    async getCustomerById(customerId) {
        try {
            return await Customer_1.CustomerModel.findById(customerId).exec();
        }
        catch (error) {
            console.error('Error fetching customer by ID:', error);
            throw new Error('Failed to fetch customer');
        }
    }
    /**
     * Search customers by name
     */
    async searchCustomers(searchTerm, createdBy) {
        try {
            const query = {
                isActive: true,
                name: { $regex: searchTerm, $options: 'i' }
            };
            if (createdBy) {
                query.createdBy = createdBy;
            }
            return await Customer_1.CustomerModel.find(query)
                .sort({ name: 1 })
                .limit(10)
                .exec();
        }
        catch (error) {
            console.error('Error searching customers:', error);
            throw new Error('Failed to search customers');
        }
    }
    /**
     * Update customer
     */
    async updateCustomer(customerId, updateData) {
        try {
            return await Customer_1.CustomerModel.findByIdAndUpdate(customerId, { ...updateData, updatedDate: new Date() }, { new: true }).exec();
        }
        catch (error) {
            console.error('Error updating customer:', error);
            throw new Error('Failed to update customer');
        }
    }
    /**
     * Deactivate customer (soft delete)
     */
    async deactivateCustomer(customerId) {
        try {
            return await Customer_1.CustomerModel.findByIdAndUpdate(customerId, { isActive: false, updatedDate: new Date() }, { new: true }).exec();
        }
        catch (error) {
            console.error('Error deactivating customer:', error);
            throw new Error('Failed to deactivate customer');
        }
    }
}
exports.CustomerService = CustomerService;
//# sourceMappingURL=customer.service.js.map