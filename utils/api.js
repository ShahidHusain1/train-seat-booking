// Get user bookings
export const getBookings = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/bookings/my-bookings`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

// Cancel booking
export const cancelBooking = async (bookingId) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/bookings/${bookingId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

// Auto-book seats
export const autoBookSeats = async (seatCount) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
        `${API_URL}/bookings/auto-book`,
        { seatCount },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};