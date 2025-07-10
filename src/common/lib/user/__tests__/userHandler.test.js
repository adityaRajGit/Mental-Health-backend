import * as userHandler from '../userHandler';
import userHelper from '../../../helpers/user.helper.js';
import appointmentHelper from '../../../helpers/appointment.helper';
import therapistHelper from '../../../helpers/therapist.helper';

jest.mock('../../../helpers/user.helper.js');
jest.mock('../../../helpers/appointment.helper');
jest.mock('../../../helpers/therapist.helper');

describe('userHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addNewUserHandler', () => {
    it('should add a new user and return the user object', async () => {
      const mockInput = { name: 'Test User', email: 'test@example.com' };
      const mockUser = { ...mockInput, _id: 'mockid123' };
      userHelper.addObject.mockResolvedValue(mockUser);
      const result = await userHandler.addNewUserHandler(mockInput);
      expect(userHelper.addObject).toHaveBeenCalledWith(expect.objectContaining(mockInput));
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserDetailsHandler', () => {
    it('should get user details by id', async () => {
      const mockInput = { id: 'user123' };
      const mockUser = { _id: 'user123', name: 'Test User' };
      userHelper.getObjectById.mockResolvedValue(mockUser);
      const result = await userHandler.getUserDetailsHandler(mockInput);
      expect(userHelper.getObjectById).toHaveBeenCalledWith(mockInput);
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserDetailsHandlerV2', () => {
    it('should get user details by string id', async () => {
      const mockUser = { _id: 'user123', name: 'Test User' };
      userHelper.getObjectById.mockResolvedValue(mockUser);
      const result = await userHandler.getUserDetailsHandlerV2('user123');
      expect(userHelper.getObjectById).toHaveBeenCalledWith({ id: 'user123' });
      expect(result).toEqual(mockUser);
    });
    it('should throw error for invalid id', async () => {
      await expect(userHandler.getUserDetailsHandlerV2({})).rejects.toThrow('Invalid user ID');
    });
  });

  describe('getTherapistsForUser', () => {
    it('should return therapists for a user', async () => {
      const userId = 'user123';
      const appointments = [
        { therapist_id: 't1', user_id: userId, is_deleted: false },
        { therapist_id: 't2', user_id: userId, is_deleted: false }
      ];
      const therapists = [
        { _id: 't1', name: 'Therapist 1' },
        { _id: 't2', name: 'Therapist 2' }
      ];
      appointmentHelper.getAllObjects.mockResolvedValue(appointments);
      therapistHelper.getAllObjects.mockResolvedValue(therapists);
      const result = await userHandler.getTherapistsForUser(userId);
      expect(result).toEqual(therapists);
    });
    it('should return empty array if no appointments', async () => {
      appointmentHelper.getAllObjects.mockResolvedValue([]);
      const result = await userHandler.getTherapistsForUser('user123');
      expect(result).toEqual([]);
    });
  });
});
