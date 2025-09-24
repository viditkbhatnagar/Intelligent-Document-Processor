import { CustomerModel, CustomerDoc } from '../models/Customer';

export class CustomerService {
  
  /**
   * Create a new customer
   */
  async createCustomer(customerData: {
    name: string;
    address: string;
    contact?: string;
    email?: string;
    country?: string;
    currency?: string;
    paymentTerms?: string;
    creditLimit?: number;
  }, createdBy: string): Promise<CustomerDoc> {
    try {
      const customer = new CustomerModel({
        ...customerData,
        createdBy
      });
      
      return await customer.save();
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new Error('Failed to create customer');
    }
  }
  
  /**
   * Get all active customers for dropdown
   */
  async getActiveCustomers(createdBy?: string): Promise<CustomerDoc[]> {
    try {
      const query: any = { isActive: true };
      if (createdBy) {
        query.createdBy = createdBy;
      }
      
      return await CustomerModel.find(query)
        .sort({ name: 1 })
        .select('name address contact email country currency')
        .exec();
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw new Error('Failed to fetch customers');
    }
  }
  
  /**
   * Get customer by ID
   */
  async getCustomerById(customerId: string): Promise<CustomerDoc | null> {
    try {
      return await CustomerModel.findById(customerId).exec();
    } catch (error) {
      console.error('Error fetching customer by ID:', error);
      throw new Error('Failed to fetch customer');
    }
  }
  
  /**
   * Search customers by name
   */
  async searchCustomers(searchTerm: string, createdBy?: string): Promise<CustomerDoc[]> {
    try {
      const query: any = {
        isActive: true,
        name: { $regex: searchTerm, $options: 'i' }
      };
      if (createdBy) {
        query.createdBy = createdBy;
      }
      
      return await CustomerModel.find(query)
        .sort({ name: 1 })
        .limit(10)
        .exec();
    } catch (error) {
      console.error('Error searching customers:', error);
      throw new Error('Failed to search customers');
    }
  }
  
  /**
   * Update customer
   */
  async updateCustomer(customerId: string, updateData: Partial<CustomerDoc>): Promise<CustomerDoc | null> {
    try {
      return await CustomerModel.findByIdAndUpdate(
        customerId,
        { ...updateData, updatedDate: new Date() },
        { new: true }
      ).exec();
    } catch (error) {
      console.error('Error updating customer:', error);
      throw new Error('Failed to update customer');
    }
  }
  
  /**
   * Deactivate customer (soft delete)
   */
  async deactivateCustomer(customerId: string): Promise<CustomerDoc | null> {
    try {
      return await CustomerModel.findByIdAndUpdate(
        customerId,
        { isActive: false, updatedDate: new Date() },
        { new: true }
      ).exec();
    } catch (error) {
      console.error('Error deactivating customer:', error);
      throw new Error('Failed to deactivate customer');
    }
  }
}
