import * as therapistHandler from '../therapistHandler';
import therapistHelper from '../../../helpers/therapist.helper';
import userHelper from '../../../helpers/user.helper';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../../util/authUtil';
import { getUserInfo } from '../../../util/utilHelper';

jest.mock('../../../helpers/therapist.helper');
jest.mock('../../../helpers/user.helper');
jest.mock('bcryptjs');
jest.mock('../../../util/authUtil');
jest.mock('../../../util/utilHelper');

describe('therapistHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addNewTherapistHandler', () => {
    it('should add a new therapist and return the therapist object', async () => {
      const mockInput = { name: 'Therapist', email: 'therapist@example.com' };
      const mockTherapist = { ...mockInput, _id: 'mockid123' };
      therapistHelper.addObject.mockResolvedValue(mockTherapist);
      const result = await therapistHandler.addNewTherapistHandler(mockInput);
      expect(therapistHelper.addObject).toHaveBeenCalledWith(mockInput);
      expect(result).toEqual(mockTherapist);
    });
  });

  describe('therapistLoginHandler', () => {
    it('should login therapist with email and return token', async () => {
      const mockInput = { email: 'therapist@example.com', password: 'pass' };
      const mockUser = { _id: 't1', email: 'therapist@example.com', password: 'hashed', name: 'Therapist', phone: '123', username: 'therapist1', role: 'therapist' };
      therapistHelper.getObjectByQuery.mockResolvedValueOnce(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      generateToken.mockReturnValue('token123');
      getUserInfo.mockReturnValue({ name: 'Therapist' });
      const result = await therapistHandler.therapistLoginHandler(mockInput);
      expect(result).toHaveProperty('therapist');
      expect(result).toHaveProperty('token', 'token123');
    });
    it('should throw if therapist not found', async () => {
      therapistHelper.getObjectByQuery.mockResolvedValue(undefined);
      await expect(therapistHandler.therapistLoginHandler({ email: 'notfound@example.com', password: 'pass' })).rejects.toEqual('Therapist not found');
    });
    it('should throw if password does not match', async () => {
      const mockUser = { _id: 't1', email: 'therapist@example.com', password: 'hashed' };
      therapistHelper.getObjectByQuery.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);
      await expect(therapistHandler.therapistLoginHandler({ email: 'therapist@example.com', password: 'wrong' })).rejects.toEqual('Invalid credentials');
    });
  });

  describe('getTherapistDetailsHandler', () => {
    it('should get therapist details by id', async () => {
      const mockInput = { id: 'therapist123' };
      const mockTherapist = { _id: 'therapist123', name: 'Therapist' };
      therapistHelper.getObjectById.mockResolvedValue(mockTherapist);
      const result = await therapistHandler.getTherapistDetailsHandler(mockInput);
      expect(therapistHelper.getObjectById).toHaveBeenCalledWith(mockInput);
      expect(result).toEqual(mockTherapist);
    });
  });

  describe('deleteTherapistHandler', () => {
    it('should delete therapist by id', async () => {
      const mockInput = 'therapist123';
      const mockDeleted = { deleted: true };
      therapistHelper.deleteObjectById.mockResolvedValue(mockDeleted);
      const result = await therapistHandler.deleteTherapistHandler(mockInput);
      expect(therapistHelper.deleteObjectById).toHaveBeenCalledWith(mockInput);
      expect(result).toEqual(mockDeleted);
    });
  });
});
