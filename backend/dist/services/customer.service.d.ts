import { CustomerDoc } from '../models/Customer';
export declare class CustomerService {
    /**
     * Create a new customer
     */
    createCustomer(customerData: {
        name: string;
        address: string;
        contact?: string;
        email?: string;
        country?: string;
        currency?: string;
        paymentTerms?: string;
        creditLimit?: number;
    }, createdBy: string): Promise<CustomerDoc>;
    /**
     * Get all active customers for dropdown
     */
    getActiveCustomers(createdBy?: string): Promise<CustomerDoc[]>;
    /**
     * Get customer by ID
     */
    getCustomerById(customerId: string): Promise<CustomerDoc | null>;
    /**
     * Search customers by name
     */
    searchCustomers(searchTerm: string, createdBy?: string): Promise<CustomerDoc[]>;
    /**
     * Update customer
     */
    updateCustomer(customerId: string, updateData: Partial<CustomerDoc>): Promise<CustomerDoc | null>;
    /**
     * Deactivate customer (soft delete)
     */
    deactivateCustomer(customerId: string): Promise<CustomerDoc | null>;
}
