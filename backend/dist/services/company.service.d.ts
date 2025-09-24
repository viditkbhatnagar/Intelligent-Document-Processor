import { CompanyDoc } from '../models/Company';
export declare class CompanyService {
    /**
     * Create a new company
     */
    createCompany(companyData: {
        name: string;
        code: string;
        address: string;
        contact: string;
        email: string;
    }): Promise<CompanyDoc>;
    /**
     * Get all active companies
     */
    getActiveCompanies(): Promise<CompanyDoc[]>;
    /**
     * Get company by ID
     */
    getCompanyById(companyId: string): Promise<CompanyDoc | null>;
    /**
     * Get company by code
     */
    getCompanyByCode(code: string): Promise<CompanyDoc | null>;
    /**
     * Update company
     */
    updateCompany(companyId: string, updateData: Partial<CompanyDoc>): Promise<CompanyDoc | null>;
    /**
     * Initialize default companies (Rock Stone and Kinship)
     */
    initializeDefaultCompanies(): Promise<void>;
}
