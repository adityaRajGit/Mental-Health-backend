import * as companyHandler from '../companyHandler';
import companyHelper from '../../../helpers/company.helper';

jest.mock('../../../helpers/company.helper');

describe('companyHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  // The tests use mocks for all companyHelper methods, so changes in the actual company model
  // (e.g., schema changes in company.js) will not affect these tests.
  // To ensure tests fail when the model changes, consider using integration tests
  // or validating the shape of the returned objects more strictly in your tests.
  describe('addNewCompanyHandler', () => {
    it('should add a new company and return the company object', async () => {
      const mockInput = {
        name: 'Example Company',
        size: '201+',
        industry: 'Technology',
        website: 'https://example.com',
        address: '123 Main St, City, Country',
        packageType: 'Custom',
        webinarsCompleted: 2,
        webinarsScheduled: 1,
        visibility: true,
        is_deleted: false,
        created_at: '2025-07-07T00:00:00.000Z',
        updated_at: '2025-07-07T00:00:00.000Z'
      };
      const mockCompany = { ...mockInput, _id: 'mockid123' };
      companyHelper.addObject.mockResolvedValue(mockCompany);
      const result = await companyHandler.addNewCompanyHandler(mockInput);
      expect(companyHelper.addObject).toHaveBeenCalledWith(mockInput);
      expect(result).toEqual(mockCompany);
    });
  });

  describe('getCompanyDetailsHandler', () => {
    it('should get company details by id', async () => {
      const mockInput = { id: 'company123' };
      const mockCompany = { _id: 'company123', name: 'Example Company' };
      companyHelper.getObjectById.mockResolvedValue(mockCompany);
      const result = await companyHandler.getCompanyDetailsHandler(mockInput);
      expect(companyHelper.getObjectById).toHaveBeenCalledWith(mockInput);
      expect(result).toEqual(mockCompany);
    });
  });

  describe('updateCompanyDetailsHandler', () => {
    it('should update company details', async () => {
      const mockInput = { objectId: 'company123', updateObject: { name: 'Updated Company' } };
      const mockUpdated = { _id: 'company123', name: 'Updated Company' };
      companyHelper.directUpdateObject.mockResolvedValue(mockUpdated);
      const result = await companyHandler.updateCompanyDetailsHandler(mockInput);
      expect(companyHelper.directUpdateObject).toHaveBeenCalledWith('company123', { name: 'Updated Company' });
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('getCompanyListHandler', () => {
    it('should return company list and count', async () => {
      const mockInput = { query: {} };
      const mockList = [{ _id: 'company1' }, { _id: 'company2' }];
      const mockCount = 2;
      companyHelper.getAllObjects.mockResolvedValue(mockList);
      companyHelper.getAllObjectCount.mockResolvedValue(mockCount);
      const result = await companyHandler.getCompanyListHandler(mockInput);
      expect(result).toEqual({ list: mockList, count: mockCount });
    });
  });

  describe('deleteCompanyHandler', () => {
    it('should delete company by id', async () => {
      const mockInput = 'company123';
      const mockDeleted = { deleted: true };
      companyHelper.deleteObjectById.mockResolvedValue(mockDeleted);
      const result = await companyHandler.deleteCompanyHandler(mockInput);
      expect(companyHelper.deleteObjectById).toHaveBeenCalledWith(mockInput);
      expect(result).toEqual(mockDeleted);
    });
  });

  describe('getCompanyByQueryHandler', () => {
    it('should get company by query', async () => {
      const mockInput = { name: 'Example Company' };
      const mockCompany = { _id: 'company123', name: 'Example Company' };
      companyHelper.getObjectByQuery.mockResolvedValue(mockCompany);
      const result = await companyHandler.getCompanyByQueryHandler(mockInput);
      expect(companyHelper.getObjectByQuery).toHaveBeenCalledWith(mockInput);
      expect(result).toEqual(mockCompany);
    });
  });
});
