// src/utils/validators.js
import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
});

export const registerSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  role: yup.string().oneOf(['student', 'owner'], 'Invalid role').required('Role is required'),
  phone: yup.string().optional()
});

export const hostelSchema = yup.object({
  name: yup.string().required('Hostel name is required'),
  description: yup.string().required('Description is required'),
  price: yup.number().min(0, 'Price must be positive').required('Price is required'),
  lat: yup.number().required('Latitude is required'),
  lng: yup.number().required('Longitude is required'),
  address: yup.string().required('Address is required'),
  availableRooms: yup.number().min(1, 'Must have at least 1 room').required('Available rooms is required'),
  amenities: yup.array().of(yup.string()).optional(),
  rentDuration: yup.string().oneOf(['monthly', 'semester', 'yearly']).required('Rent duration is required'),
  images: yup.array().of(yup.string()).optional()
});

export const reviewSchema = yup.object({
  rating: yup.number().min(1).max(5).required('Rating is required'),
  comment: yup.string().required('Comment is required')
});

export const messageSchema = yup.object({
  content: yup.string().required('Message content is required')
});



// // src/utils/validators.js - UPDATE hostelSchema
// import * as yup from 'yup';

// export const hostelSchema = yup.object({
//   name: yup.string()
//     .required('Hostel name is required')
//     .min(3, 'Hostel name must be at least 3 characters')
//     .max(100, 'Hostel name must be less than 100 characters'),
  
//   description: yup.string()
//     .required('Description is required')
//     .min(20, 'Description must be at least 20 characters')
//     .max(2000, 'Description must be less than 2000 characters'),
  
//   price: yup.number()
//     .typeError('Price must be a number')
//     .required('Price is required')
//     .min(0, 'Price cannot be negative')
//     .max(100000, 'Price seems too high'),
  
//   lat: yup.number()
//     .typeError('Latitude must be a number')
//     .required('Latitude is required')
//     .min(-90, 'Invalid latitude')
//     .max(90, 'Invalid latitude'),
  
//   lng: yup.number()
//     .typeError('Longitude must be a number')
//     .required('Longitude is required')
//     .min(-180, 'Invalid longitude')
//     .max(180, 'Invalid longitude'),
  
//   address: yup.string()
//     .required('Address is required')
//     .min(5, 'Address must be at least 5 characters')
//     .max(500, 'Address must be less than 500 characters'),
  
//   availableRooms: yup.number()
//     .typeError('Available rooms must be a number')
//     .required('Available rooms is required')
//     .min(1, 'Must have at least 1 room')
//     .max(1000, 'Cannot have more than 1000 rooms'),
  
//   amenities: yup.array()
//     .of(yup.string())
//     .default([]),
  
//   rentDuration: yup.string()
//     .oneOf(['monthly', 'semester', 'yearly'], 'Invalid rent duration')
//     .required('Rent duration is required'),
  
//   images: yup.array()
//     .of(yup.string().url('Image must be a valid URL'))
//     .default([])
//     .max(10, 'Maximum 10 images allowed')
// });