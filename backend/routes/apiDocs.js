import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    endpoints: {
      auth: {
        register: 'POST /api/v1/auth/register',
        login: 'POST /api/v1/auth/login',
        refresh: 'POST /api/v1/auth/refresh-token',
        logout: 'POST /api/v1/auth/logout'
      },
      users: {
        getProfile: 'GET /api/v1/users/me',
        updateProfile: 'PUT /api/v1/users/me',
        changePassword: 'PUT /api/v1/users/change-password'
      },
      hostels: {
        list: 'GET /api/v1/hostels',
        create: 'POST /api/v1/hostels',
        get: 'GET /api/v1/hostels/:id',
        update: 'PUT /api/v1/hostels/:id',
        delete: 'DELETE /api/v1/hostels/:id'
      },
      bookings: {
        initiate: 'POST /api/v1/bookings/initiate',
        verify: 'POST /api/v1/bookings/verify',
        list: 'GET /api/v1/bookings',
        get: 'GET /api/v1/bookings/:id'
      },
      messages: {
        send: 'POST /api/v1/messages',
        conversation: 'GET /api/v1/messages/conversation/:userId',
        unread: 'GET /api/v1/messages/unread',
        conversations: 'GET /api/v1/messages/conversations'
      },
      uploads: {
        upload: 'POST /api/v1/upload',
        config: 'GET /api/v1/upload/unsigned'
      },
      analytics: {
        admin: 'GET /api/v1/analytics/overview',
        owner: 'GET /api/v1/analytics/owner',
        dashboard: 'GET /api/v1/analytics/dashboard'
      }
    }
  });
});

export default router;