import * as adminHandler from '../adminHandler';
import adminHelper from '../../../helpers/admin.helper.js';

jest.mock('../../../helpers/admin.helper.js');

describe('adminHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addNewAdminHandler', () => {
    it('should add a new admin and return the admin object', async () => {
      const mockInput = { name: 'Admin', email: 'admin@example.com' };
      const mockAdmin = { ...mockInput, _id: 'mockid123' };
      adminHelper.addObject.mockResolvedValue(mockAdmin);
      const result = await adminHandler.addNewAdminHandler(mockInput);
      expect(adminHelper.addObject).toHaveBeenCalledWith(mockInput);
      expect(result).toEqual(mockAdmin);
    });
  });

  describe('getAdminDetailsHandler', () => {
    it('should get admin details by id', async () => {
      const mockInput = { id: 'admin123' };
      const mockAdmin = { _id: 'admin123', name: 'Admin' };
      adminHelper.getObjectById.mockResolvedValue(mockAdmin);
      const result = await adminHandler.getAdminDetailsHandler(mockInput);
      expect(adminHelper.getObjectById).toHaveBeenCalledWith(mockInput);
      expect(result).toEqual(mockAdmin);
    });
  });

  describe('updateAdminDetailsHandler', () => {
    it('should update admin details', async () => {
      const mockInput = { objectId: 'admin123', updateObject: { name: 'Updated Admin' } };
      const mockUpdated = { _id: 'admin123', name: 'Updated Admin' };
      adminHelper.directUpdateObject.mockResolvedValue(mockUpdated);
      const result = await adminHandler.updateAdminDetailsHandler(mockInput);
      expect(adminHelper.directUpdateObject).toHaveBeenCalledWith('admin123', { name: 'Updated Admin' });
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('getAdminListHandler', () => {
    it('should return admin list and count', async () => {
      const mockInput = { query: {} };
      const mockList = [{ _id: 'admin1' }, { _id: 'admin2' }];
      const mockCount = 2;
      adminHelper.getAllObjects.mockResolvedValue(mockList);
      adminHelper.getAllObjectCount.mockResolvedValue(mockCount);
      const result = await adminHandler.getAdminListHandler(mockInput);
      expect(result).toEqual({ list: mockList, count: mockCount });
    });
  });

  describe('deleteAdminHandler', () => {
    it('should delete admin by id', async () => {
      const mockInput = 'admin123';
      const mockDeleted = { deleted: true };
      adminHelper.deleteObjectById.mockResolvedValue(mockDeleted);
      const result = await adminHandler.deleteAdminHandler(mockInput);
      expect(adminHelper.deleteObjectById).toHaveBeenCalledWith(mockInput);
      expect(result).toEqual(mockDeleted);
    });
  });
});
