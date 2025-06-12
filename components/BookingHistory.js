import { toast } from 'react-toastify';

export default function BookingHistory({ history, seats, user }) {
  if (!history.length) return null;

  const handleCancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://vercel-backend-amber-beta.vercel.app/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok) {
        toast.success('Booking canceled successfully!');
        // Trigger a refresh of seats and history (you can pass a callback prop to handle this in the parent)
        window.location.reload(); // Temporary solution; ideally, update state in parent
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel booking');
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-lg mt-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        <span className="mr-2">📜</span> Your Booking History
      </h2>
      <div className="space-y-4">
        {history.map((booking, index) => {
          const bookingSeats = seats.filter(seat => booking.seat_numbers.includes(seat.seat_number));
          return (
            <div
              key={booking.id}
              className="bg-white p-5 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Booking ID */}
                <div>
                  <p className="text-sm text-gray-500">Booking ID</p>
                  <p className="font-semibold text-gray-800">{booking.id}</p>
                </div>
                {/* Date */}
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(booking.booking_time).toLocaleString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {/* Seats */}
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Seats</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {bookingSeats.map(seat => (
                      <span
                        key={seat.seat_number}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                      >
                        Seat {seat.seat_number} (Row {seat.row_number})
                      </span>
                    ))}
                  </div>
                </div>
                {/* Status and Action */}
                <div className="flex flex-col items-start md:items-end">
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      Confirmed
                    </span>
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium hover:bg-red-200 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
