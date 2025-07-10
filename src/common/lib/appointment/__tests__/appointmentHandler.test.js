import * as appointmentHandler from '../appointmentHandler';
import appointmentHelper from '../../../helpers/appointment.helper';

jest.mock('../../../helpers/appointment.helper');

describe('appointmentHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addNewAppointmentHandler', () => {
    it('should add a new appointment and return the appointment object', async () => {
      const mockInput = {
        user_id: 'user123',
        therapist_id: 'therapist123',
        scheduled_at: '2025-07-07T10:00:00.000Z',
        duration: 60,
        is_deleted: false
      };
      const mockAppointment = { ...mockInput, _id: 'mockid123' };
      appointmentHelper.addObject.mockResolvedValue(mockAppointment);
      const result = await appointmentHandler.addNewAppointmentHandler(mockInput);
      expect(appointmentHelper.addObject).toHaveBeenCalledWith(mockInput);
      expect(result).toEqual(mockAppointment);
    });
  });

  describe('getAllUpcomingAppointmentsHandler', () => {
    it('should get all upcoming appointments', async () => {
      const now = new Date();
      const mockList = [{ _id: 'a1', scheduled_at: new Date(now.getTime() + 10000) }];
      appointmentHelper.getAllObjects.mockResolvedValue(mockList);
      const result = await appointmentHandler.getAllUpcomingAppointmentsHandler();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getAllPastAppointmentsHandler', () => {
    it('should get all past appointments', async () => {
      const now = new Date();
      const mockList = [{ _id: 'a2', scheduled_at: new Date(now.getTime() - 10000) }];
      appointmentHelper.getAllObjects.mockResolvedValue(mockList);
      const result = await appointmentHandler.getAllPastAppointmentsHandler();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getAppointmentDetailsHandler', () => {
    it('should get appointment details by id', async () => {
      const mockInput = { id: 'appointment123' };
      const mockAppointment = { _id: 'appointment123', user_id: 'user123' };
      appointmentHelper.getObjectById.mockResolvedValue(mockAppointment);
      const result = await appointmentHandler.getAppointmentDetailsHandler(mockInput);
      expect(appointmentHelper.getObjectById).toHaveBeenCalledWith(mockInput);
      expect(result).toEqual(mockAppointment);
    });
  });

  describe('updateAppointmentDetailsHandler', () => {
    it('should update appointment details', async () => {
      const mockInput = { objectId: 'appointment123', updateObject: { duration: 90 } };
      const mockUpdated = { _id: 'appointment123', duration: 90 };
      appointmentHelper.directUpdateObject.mockResolvedValue(mockUpdated);
      const result = await appointmentHandler.updateAppointmentDetailsHandler(mockInput);
      expect(appointmentHelper.directUpdateObject).toHaveBeenCalledWith('appointment123', { duration: 90 });
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('getAppointmentListHandler', () => {
    it('should return appointment list and count', async () => {
      const mockInput = { query: {} };
      const mockList = [{ _id: 'a1' }, { _id: 'a2' }];
      const mockCount = 2;
      appointmentHelper.getAllObjects.mockResolvedValue(mockList);
      appointmentHelper.getAllObjectCount.mockResolvedValue(mockCount);
      const result = await appointmentHandler.getAppointmentListHandler(mockInput);
      expect(result).toEqual({ list: mockList, count: mockCount });
    });
  });

  describe('deleteAppointmentHandler', () => {
    it('should delete appointment by id', async () => {
      const mockInput = 'appointment123';
      const mockDeleted = { deleted: true };
      appointmentHelper.deleteObjectById.mockResolvedValue(mockDeleted);
      const result = await appointmentHandler.deleteAppointmentHandler(mockInput);
      expect(appointmentHelper.deleteObjectById).toHaveBeenCalledWith(mockInput);
      expect(result).toEqual(mockDeleted);
    });
  });

  describe('getAppointmentByQueryHandler', () => {
    it('should get appointment by query', async () => {
      const mockInput = { user_id: 'user123' };
      const mockAppointment = { _id: 'appointment123', user_id: 'user123' };
      appointmentHelper.getObjectByQuery.mockResolvedValue(mockAppointment);
      const result = await appointmentHandler.getAppointmentByQueryHandler(mockInput);
      expect(appointmentHelper.getObjectByQuery).toHaveBeenCalledWith(mockInput);
      expect(result).toEqual(mockAppointment);
    });
  });
});
