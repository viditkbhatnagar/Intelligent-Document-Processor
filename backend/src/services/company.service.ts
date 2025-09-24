import { CompanyModel, CompanyDoc } from '../models/Company';

export class CompanyService {
  
  /**
   * Create a new company
   */
  async createCompany(companyData: {
    name: string;
    code: string;
    address: string;
    contact: string;
    email: string;
  }): Promise<CompanyDoc> {
    try {
      const company = new CompanyModel(companyData);
      return await company.save();
    } catch (error) {
      console.error('Error creating company:', error);
      throw new Error('Failed to create company');
    }
  }
  
  /**
   * Get all active companies
   */
  async getActiveCompanies(): Promise<CompanyDoc[]> {
    try {
      return await CompanyModel.find({ isActive: true })
        .sort({ name: 1 })
        .exec();
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw new Error('Failed to fetch companies');
    }
  }
  
  /**
   * Get company by ID
   */
  async getCompanyById(companyId: string): Promise<CompanyDoc | null> {
    try {
      return await CompanyModel.findById(companyId).exec();
    } catch (error) {
      console.error('Error fetching company by ID:', error);
      throw new Error('Failed to fetch company');
    }
  }
  
  /**
   * Get company by code
   */
  async getCompanyByCode(code: string): Promise<CompanyDoc | null> {
    try {
      return await CompanyModel.findOne({ code: code.toUpperCase(), isActive: true }).exec();
    } catch (error) {
      console.error('Error fetching company by code:', error);
      throw new Error('Failed to fetch company');
    }
  }
  
  /**
   * Update company
   */
  async updateCompany(companyId: string, updateData: Partial<CompanyDoc>): Promise<CompanyDoc | null> {
    try {
      return await CompanyModel.findByIdAndUpdate(
        companyId,
        { ...updateData, updatedDate: new Date() },
        { new: true }
      ).exec();
    } catch (error) {
      console.error('Error updating company:', error);
      throw new Error('Failed to update company');
    }
  }
  
  /**
   * Initialize default companies (Rock Stone and Kinship)
   */
  async initializeDefaultCompanies(): Promise<void> {
    try {
      const companies = [
        {
          name: 'Rock Stone',
          code: 'RS',
          address: 'Dubai, UAE',
          contact: '+971-XXX-XXXX',
          email: 'info@rockstone.ae'
        },
        {
          name: 'Kinship',
          code: 'KS',
          address: 'Dubai, UAE',
          contact: '+971-XXX-XXXX',
          email: 'info@kinship.ae'
        }
      ];
      
      for (const companyData of companies) {
        // Check if company already exists
        const existingCompany = await CompanyModel.findOne({ code: companyData.code });
        
        if (!existingCompany) {
          await this.createCompany(companyData);
          console.log(`✅ Created company: ${companyData.name}`);
        } else {
          console.log(`⚠️ Company ${companyData.name} already exists`);
        }
      }
    } catch (error) {
      console.error('Error initializing default companies:', error);
      throw new Error('Failed to initialize default companies');
    }
  }
}
