import * as leadHandler from '../leadHandler';
import leadHelper from '../../../helpers/lead.helper';

jest.mock('../../../helpers/lead.helper');

describe('leadHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addNewLeadHandler', () => {
    it('should add a new lead and return the lead object', async () => {
      const mockInput = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        company: 'Example Inc.',
        employees: '50-100',
        phone: '+1234567890',
        timeline: 'Q3 2025',
        message: 'Looking for a demo.',
        is_deleted: false,
        created_at: '2025-07-07T00:00:00.000Z',
        updated_at: '2025-07-07T00:00:00.000Z'
      };
      const mockLead = { ...mockInput, _id: 'mockid123' };
      leadHelper.addObject.mockResolvedValue(mockLead);
      const result = await leadHandler.addNewLeadHandler(mockInput);
      expect(leadHelper.addObject).toHaveBeenCalledWith(mockInput);
      expect(result).toEqual(mockLead);
    });
  });

  describe('getLeadDetailsHandler', () => {
    it('should get lead details by id', async () => {
      const mockInput = { id: 'lead123' };
      const mockLead = { _id: 'lead123', name: 'John Doe' };
      leadHelper.getObjectById.mockResolvedValue(mockLead);
      const result = await leadHandler.getLeadDetailsHandler(mockInput);
      expect(leadHelper.getObjectById).toHaveBeenCalledWith(mockInput);
      expect(result).toEqual(mockLead);
    });
  });

  describe('updateLeadDetailsHandler', () => {
    it('should update lead details', async () => {
      const mockInput = { objectId: 'lead123', updateObject: { name: 'Jane Doe' } };
      const mockUpdated = { _id: 'lead123', name: 'Jane Doe' };
      leadHelper.directUpdateObject.mockResolvedValue(mockUpdated);
      const result = await leadHandler.updateLeadDetailsHandler(mockInput);
      expect(leadHelper.directUpdateObject).toHaveBeenCalledWith('lead123', { name: 'Jane Doe' });
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('getLeadListHandler', () => {
    it('should return lead list and count', async () => {
      const mockInput = { query: {} };
      const mockList = [{ _id: 'lead1' }, { _id: 'lead2' }];
      const mockCount = 2;
      leadHelper.getAllObjects.mockResolvedValue(mockList);
      leadHelper.getAllObjectCount.mockResolvedValue(mockCount);
      const result = await leadHandler.getLeadListHandler(mockInput);
      expect(result).toEqual({ list: mockList, count: mockCount });
    });
  });

  describe('deleteLeadHandler', () => {
    it('should delete lead by id', async () => {
      const mockInput = 'lead123';
      const mockDeleted = { deleted: true };
      leadHelper.deleteObjectById.mockResolvedValue(mockDeleted);
      const result = await leadHandler.deleteLeadHandler(mockInput);
      expect(leadHelper.deleteObjectById).toHaveBeenCalledWith(mockInput);
      expect(result).toEqual(mockDeleted);
    });
  });

  describe('getLeadByQueryHandler', () => {
    it('should get lead by query', async () => {
      const mockInput = { email: 'john.doe@example.com' };
      const mockLead = { _id: 'lead123', email: 'john.doe@example.com' };
      leadHelper.getObjectByQuery.mockResolvedValue(mockLead);
      const result = await leadHandler.getLeadByQueryHandler(mockInput);
      expect(leadHelper.getObjectByQuery).toHaveBeenCalledWith(mockInput);
      expect(result).toEqual(mockLead);
    });
  });
});
