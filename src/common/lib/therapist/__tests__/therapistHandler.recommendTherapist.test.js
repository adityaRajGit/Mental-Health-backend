import { recommendTherapistsHandler } from '../therapistHandler';
import therapistHelper from '../../../helpers/therapist.helper';
import availabilityHelper from '../../../helpers/availability.helper';
import appointmentHelper from '../../../helpers/appointment.helper';

// Mock the dependencies
jest.mock('../../../helpers/therapist.helper');
jest.mock('../../../helpers/availability.helper');
jest.mock('../../../helpers/appointment.helper');

// Mock therapists with different specializations and attributes
const mockTherapists = [
  {
    _id: '688a8326e13bf75d47c469dd',
    name: 'Dr. Arvind Menon',
    email: 'arvind.menon@example.com',
    specialization: ['Anxiety', 'Cognitive Behavioral Therapy', 'Workplace Stress'],
    languages: ['en', 'hi'],
    location: { city: 'Mumbai', country: 'India' },
    profile_image: 'https://example.com/images/arvind.jpg',
    session_details: { duration: 50, cost: 2000, currency: '₹' },
    is_deleted: false
  },
  {
    _id: '688a832fe13bf75d47c469df',
    name: 'Mr. Faizan Shaikh',
    email: 'faizan.shaikh@example.com',
    specialization: ['Addiction', 'Youth Counseling', 'Mindfulness-Based Therapy'],
    languages: ['en', 'ur', 'hi'],
    location: { city: 'Hyderabad', country: 'India' },
    profile_image: 'https://example.com/images/faizan.jpg',
    session_details: { duration: 60, cost: 1700, currency: '₹' },
    is_deleted: false
  },
  {
    _id: '688a8335e13bf75d47c469e0',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@example.com',
    specialization: ['Depression', 'Family Therapy', 'Grief Counseling'],
    languages: ['en', 'hi', 'pa'],
    location: { city: 'Delhi', country: 'India' },
    profile_image: 'https://example.com/images/priya.jpg',
    session_details: { duration: 45, cost: 1800, currency: '₹' },
    is_deleted: false
  }
];

// Mock availability data
const mockAvailabilities = [
  {
    _id: '688f74745f84f00840b69060',
    therapist: '688a8326e13bf75d47c469dd',
    days: {
      sunday: [],
      monday: [{ from: '09:30', to: '10:30' }],
      tuesday: [
        { from: '09:00', to: '12:00' },
        { from: '14:00', to: '17:00' }
      ],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: []
    },
    is_deleted: false
  },
  {
    _id: '688f74065f84f00840b6905e',
    therapist: '688a832fe13bf75d47c469df',
    days: {
      sunday: [],
      monday: [
        { from: '09:00', to: '12:00' },
        { from: '14:00', to: '17:00' }
      ],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: []
    },
    is_deleted: false
  },
  {
    _id: '688f74285f84f00840b6905f',
    therapist: '688a8335e13bf75d47c469e0',
    days: {
      sunday: [],
      monday: [],
      tuesday: [],
      wednesday: [{ from: '10:00', to: '16:00' }],
      thursday: [{ from: '13:00', to: '18:00' }],
      friday: [{ from: '09:00', to: '11:00' }],
      saturday: []
    },
    is_deleted: false
  }
];

// Mock appointments (for conflict testing)
const mockAppointments = [
  {
    _id: '690123456789abcdef123456',
    therapist_id: '688a8326e13bf75d47c469dd',
    scheduled_at: new Date('2025-08-26T10:00:00'),
    duration: 60,
    payment_status: 'CONFIRMED',
    is_deleted: false
  }
];

// Helper to prepare mocks for each test
function setupMocks(appointments = []) {
  // Reset all mocks
  jest.clearAllMocks();
  
  // Setup therapist helper mock
  therapistHelper.getAllObjects.mockResolvedValue(mockTherapists);
  therapistHelper.getObjectById.mockImplementation((id) => {
    const therapist = mockTherapists.find(t => t._id === id);
    return Promise.resolve(therapist || null);
  });
  
  // Setup availability helper mock
  availabilityHelper.getAllObjects.mockImplementation(({ query }) => {
    // Extract day from query if available
    let dayOfWeek = '';
    if (query && Object.keys(query).some(key => key.startsWith('days.'))) {
      const dayKey = Object.keys(query).find(key => key.startsWith('days.'));
      dayOfWeek = dayKey.replace('days.', '');
    }
    
    // If no day specified, return all availabilities
    if (!dayOfWeek) {
      return Promise.resolve(mockAvailabilities);
    }
    
    // Filter availabilities by day
    const filtered = mockAvailabilities.filter(a => 
      a.days[dayOfWeek] && a.days[dayOfWeek].length > 0 && !a.is_deleted
    );
    
    return Promise.resolve(filtered);
  });
  
  // Setup appointment helper mock
  appointmentHelper.getAllObjects.mockResolvedValue(appointments);
}

describe('recommendTherapistsHandler', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  // Test Case 1: Perfect match - specialization and time
  test('should recommend therapist with matching specialization and time slot', async () => {
    setupMocks();
    
    const input = {
      user_id: '689af64d663fcc6bd9aa461f',
      preferred_datetime: '2025-08-26T09:30:00',
      specialization: 'Anxiety',
      language: ['en']
    };
    
    const result = await recommendTherapistsHandler(input);
    
    expect(result.recommendedTherapist).not.toBeNull();
    expect(result.recommendedTherapist.id).toBe('688a8326e13bf75d47c469dd');
    expect(result.recommendedTherapist.name).toBe('Dr. Arvind Menon');
    expect(result.recommendedTherapist.available_slot).toEqual({ from: '09:00', to: '12:00' });
    expect(result.recommendedTherapist.score).toBeGreaterThan(0);
  });

  // Test Case 2: No matching specialization, but matching time
  test('should recommend random therapist when no specialization match but time matches', async () => {
    setupMocks();
    
    const input = {
      user_id: '689af64d663fcc6bd9aa461f',
      preferred_datetime: '2025-08-26T09:30:00', // Tuesday
      specialization: 'Something Nonexistent',
      language: ['en']
    };
    
    const result = await recommendTherapistsHandler(input);
    
    expect(result.recommendedTherapist).not.toBeNull();
    expect(result.recommendedTherapist.id).toBe('688a8326e13bf75d47c469dd'); // Only therapist available Tuesday
    expect(result.recommendedTherapist.random_assignment).toBe(true);
  });

  // Test Case 3: No matching time slot
  test('should return null when no therapist has matching time slot', async () => {
    setupMocks();
    
    const input = {
      user_id: '689af64d663fcc6bd9aa461f',
      preferred_datetime: '2025-08-24T09:30:00', // Sunday - no availability
      specialization: 'Anxiety',
      language: ['en']
    };
    
    const result = await recommendTherapistsHandler(input);
    
    expect(result.recommendedTherapist).toBeNull();
  });

  // Test Case 4: Therapist has a conflict
  test('should not recommend therapist with conflicting appointment', async () => {
    setupMocks(mockAppointments);
    
    const input = {
      user_id: '689af64d663fcc6bd9aa461f',
      preferred_datetime: '2025-08-26T10:00:00', // Conflicts with appointment
      specialization: 'Anxiety',
      language: ['en']
    };
    
    const result = await recommendTherapistsHandler(input);
    
    // Should not recommend Dr. Arvind who has a conflict
    expect(result.recommendedTherapist).toBeNull();
  });

  // Test Case 5: Edge case - boundary time
  test('should handle boundary time slots correctly', async () => {
    setupMocks();
    
    const input = {
      user_id: '689af64d663fcc6bd9aa461f',
      preferred_datetime: '2025-08-26T12:00:00', // Exactly at the end of slot
      specialization: 'Anxiety',
      language: ['en']
    };
    
    const result = await recommendTherapistsHandler(input);
    
    // Should not match because it's at the boundary
    expect(result.recommendedTherapist).toBeNull();
  });

  // Test Case 6: Invalid input
  test('should throw error for invalid input', async () => {
    setupMocks();
    
    const input = {
      user_id: '689af64d663fcc6bd9aa461f',
      // Missing preferred_datetime
      specialization: 'Anxiety',
      language: ['en']
    };
    
    await expect(recommendTherapistsHandler(input)).rejects.toMatch(/All fields.*are required/);
  });

  // Test Case 7: Multiple therapists match
  test('should select highest scoring therapist when multiple match', async () => {
    // Modify mocks for this specific test
    const customAvailabilities = [
      {
        _id: '688f74745f84f00840b69060',
        therapist: '688a8326e13bf75d47c469dd', // Anxiety specialist
        days: {
          monday: [{ from: '09:00', to: '12:00' }]
        },
        is_deleted: false
      },
      {
        _id: '688f74065f84f00840b6905e',
        therapist: '688a832fe13bf75d47c469df', // Addiction specialist
        days: {
          monday: [{ from: '09:00', to: '12:00' }]
        },
        is_deleted: false
      }
    ];
    
    availabilityHelper.getAllObjects.mockResolvedValue(customAvailabilities);
    therapistHelper.getAllObjects.mockResolvedValue(mockTherapists);
    
    const input = {
      user_id: '689af64d663fcc6bd9aa461f',
      preferred_datetime: '2025-08-25T10:00:00', // Monday
      specialization: 'Anxiety', // Matches Dr. Arvind
      language: ['en']
    };
    
    const result = await recommendTherapistsHandler(input);
    
    expect(result.recommendedTherapist).not.toBeNull();
    expect(result.recommendedTherapist.id).toBe('688a8326e13bf75d47c469dd'); // Should pick Arvind due to specialization match
    expect(result.recommendedTherapist.score).toBeGreaterThan(4); // Time(4) + Specialization(3)
  });

  // Test Case 8: Language preference scoring
  test('should prioritize language matches in scoring', async () => {
    setupMocks();
    
    // Both therapists are available, but one matches Hindi language preference
    const input = {
      user_id: '689af64d663fcc6bd9aa461f',
      preferred_datetime: '2025-08-26T10:00:00',
      specialization: 'Anxiety',
      language: ['hi']
    };
    
    const result = await recommendTherapistsHandler(input);
    
    expect(result.recommendedTherapist).not.toBeNull();
    expect(result.recommendedTherapist.id).toBe('688a8326e13bf75d47c469dd');
    // Should have language points in score
    expect(result.recommendedTherapist.score).toBeGreaterThan(6); // Time(4) + Specialization(3) + Language(2)
  });

  // Test Case 9: Exact time in range check
  test('should correctly check if time is in range', async () => {
    setupMocks();
    
    // Edge time 11:59 should be in the 9:00-12:00 range
    const input = {
      user_id: '689af64d663fcc6bd9aa461f',
      preferred_datetime: '2025-08-26T11:59:00',
      specialization: 'Anxiety',
      language: ['en']
    };
    
    const result = await recommendTherapistsHandler(input);
    
    expect(result.recommendedTherapist).not.toBeNull();
    expect(result.recommendedTherapist.available_slot).toEqual({ from: '09:00', to: '12:00' });
  });

  // Test Case 10: Maximum failed attempts
  test('should throw error after maximum failed attempts', async () => {
    setupMocks();
    
    // Setup a situation where recommendation will fail
    const userId = '689af64d663fcc6bd9aa461f';
    const input = {
      user_id: userId,
      preferred_datetime: '2025-08-24T09:30:00', // Sunday - no availability
      specialization: 'Anxiety',
      language: ['en']
    };
    
    // Make 4 failed attempts
    for (let i = 0; i < 4; i++) {
      await recommendTherapistsHandler(input).catch(() => {});
    }
    
    // 5th attempt should throw the specific error
    await expect(recommendTherapistsHandler(input))
      .rejects.toMatch(/Server Busy, Please Try Again/);
  });
});