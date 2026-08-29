import axios from 'axios';

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:3005/api/v1';

const AUTH_URL = GATEWAY_URL;
const AIRLINE_URL = GATEWAY_URL;
const BOOKING_URL = GATEWAY_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'x-access-token': token } : {};
};

export const authApi = {
    signup: async (email, password) => {
        const response = await axios.post(`${AUTH_URL}/users/signup`, { email, password });
        return response.data;
    },
    signin: async (email, password) => {
        const response = await axios.post(`${AUTH_URL}/users/signin`, { email, password });
        return response.data;
    },
    getProfile: async () => {
        const response = await axios.get(`${AUTH_URL}/users/profile`, { headers: getAuthHeaders() });
        return response.data;
    },
    updateProfile: async (profileData) => {
        const response = await axios.patch(`${AUTH_URL}/users/profile`, profileData, { headers: getAuthHeaders() });
        return response.data;
    },
    forgotPassword: async (email) => {
        const response = await axios.post(`${AUTH_URL}/users/forgot-password`, { email });
        return response.data;
    },
    resetPassword: async (token, password) => {
        const response = await axios.post(`${AUTH_URL}/users/reset-password`, { token, password });
        return response.data;
    }
};

export const airlineApi = {
    getFlights: async (params) => {
        const response = await axios.get(`${AIRLINE_URL}/flights`, { params });
        return response.data;
    },
    getFlight: async (id) => {
        const response = await axios.get(`${AIRLINE_URL}/flights/${id}`);
        return response.data;
    },
    updateFlightStatus: async (id, status) => {
        const response = await axios.patch(
            `${AIRLINE_URL}/flights/${id}/status`, 
            { status }, 
            { headers: getAuthHeaders() }
        );
        return response.data;
    }
};

export const bookingApi = {
    getSeatMap: async (flightId) => {
        const response = await axios.get(`${BOOKING_URL}/bookings/flights/${flightId}/seats`);
        return response.data;
    },
    createBooking: async (bookingData) => {
        const response = await axios.post(
            `${BOOKING_URL}/bookings`, 
            bookingData, 
            { headers: getAuthHeaders() }
        );
        return response.data;
    },
    getMyBookings: async () => {
        const response = await axios.get(
            `${BOOKING_URL}/bookings/my-bookings`, 
            { headers: getAuthHeaders() }
        );
        return response.data;
    },
    makePayment: async (paymentData, idempotencyKey) => {
        const response = await axios.post(
            `${BOOKING_URL}/bookings/payments`, 
            paymentData, 
            { 
                headers: {
                    ...getAuthHeaders(),
                    'x-idempotency-key': idempotencyKey
                }
            }
        );
        return response.data;
    },
    createRoundTripBooking: async (bookingData) => {
        const response = await axios.post(
            `${BOOKING_URL}/bookings/roundtrip`, 
            bookingData, 
            { headers: getAuthHeaders() }
        );
        return response.data;
    },
    makeRoundTripPayment: async (paymentData, idempotencyKey) => {
        const response = await axios.post(
            `${BOOKING_URL}/bookings/payments/roundtrip`, 
            paymentData, 
            { 
                headers: {
                    ...getAuthHeaders(),
                    'x-idempotency-key': idempotencyKey
                }
            }
        );
        return response.data;
    },
    createRazorpayOrder: async (amount) => {
        const response = await axios.post(
            `${BOOKING_URL}/bookings/razorpay/create-order`, 
            { amount }, 
            { headers: getAuthHeaders() }
        );
        return response.data;
    }
};
