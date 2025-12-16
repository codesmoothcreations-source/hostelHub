export const getCoordinatesFromAddress = async (address) => {
  // Simple implementation - in production, use a geocoding service
  // This returns mock coordinates for development
  return {
    lat: 6.5244 + (Math.random() * 0.1 - 0.05), // Random near Lagos
    lng: 3.3792 + (Math.random() * 0.1 - 0.05)
  };
};