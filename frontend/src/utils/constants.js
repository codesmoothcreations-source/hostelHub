// src/utils/constants.js
export const ROLES = {
  STUDENT: 'student',
  OWNER: 'owner',
  ADMIN: 'admin'
};

export const HOSTEL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed'
};

export const BOOKING_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const AMENITIES = [
  'WiFi',
  'AC',
  'Kitchen',
  'Laundry',
  'Parking',
  'Security',
  'Gym',
  'Pool',
  'Study Room',
  'Cafeteria',
  '24/7 Electricity',
  'Water Supply',
  'TV',
  'Fridge',
  'Microwave'
];

export const RENT_DURATIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'semester', label: 'Semester' },
  { value: 'yearly', label: 'Yearly' }
];