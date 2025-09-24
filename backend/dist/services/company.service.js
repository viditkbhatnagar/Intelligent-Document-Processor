"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyService = void 0;
const Company_1 = require("../models/Company");
class CompanyService {
    /**
     * Create a new company
     */
    async createCompany(companyData) {
        try {
            const company = new Company_1.CompanyModel(companyData);
            return await company.save();
        }
        catch (error) {
            console.error('Error creating company:', error);
            throw new Error('Failed to create company');
        }
    }
    /**
     * Get all active companies
     */
    async getActiveCompanies() {
        try {
            return await Company_1.CompanyModel.find({ isActive: true })
                .sort({ name: 1 })
                .exec();
        }
        catch (error) {
            console.error('Error fetching companies:', error);
            throw new Error('Failed to fetch companies');
        }
    }
    /**
     * Get company by ID
     */
    async getCompanyById(companyId) {
        try {
            return await Company_1.CompanyModel.findById(companyId).exec();
        }
        catch (error) {
            console.error('Error fetching company by ID:', error);
            throw new Error('Failed to fetch company');
        }
    }
    /**
     * Get company by code
     */
    async getCompanyByCode(code) {
        try {
            return await Company_1.CompanyModel.findOne({ code: code.toUpperCase(), isActive: true }).exec();
        }
        catch (error) {
            console.error('Error fetching company by code:', error);
            throw new Error('Failed to fetch company');
        }
    }
    /**
     * Update company
     */
    async updateCompany(companyId, updateData) {
        try {
            return await Company_1.CompanyModel.findByIdAndUpdate(companyId, { ...updateData, updatedDate: new Date() }, { new: true }).exec();
        }
        catch (error) {
            console.error('Error updating company:', error);
            throw new Error('Failed to update company');
        }
    }
    /**
     * Initialize default companies (Rock Stone and Kinship)
     */
    async initializeDefaultCompanies() {
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
                const existingCompany = await Company_1.CompanyModel.findOne({ code: companyData.code });
                if (!existingCompany) {
                    await this.createCompany(companyData);
                    console.log(`✅ Created company: ${companyData.name}`);
                }
                else {
                    console.log(`⚠️ Company ${companyData.name} already exists`);
                }
            }
        }
        catch (error) {
            console.error('Error initializing default companies:', error);
            throw new Error('Failed to initialize default companies');
        }
    }
}
exports.CompanyService = CompanyService;
//# sourceMappingURL=company.service.js.map