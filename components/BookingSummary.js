export default function BookingSummary({ selectedSeats, seats, onBook, isAuthenticated, onLogin, onSignup }) {
  const selectedSeatDetails = selectedSeats.map(num => seats.find(s => s.seat_number === num));

  return (
    <div className="md:w-80 sticky top-4">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-gray-800 ">Booking Summary</h2>
        {selectedSeats.length > 0 ? (
          <>
            <div className="mb-4">
              <h3 className="font-semibold mb-2 text-gray-700">Selected Seats ({selectedSeats.length}):</h3>
              <div className="flex flex-wrap gap-2">
                {selectedSeatDetails.map(seat => (
                  <span key={seat.seat_number} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    Seat {seat.seat_number} (Row {seat.row_number})
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={onBook}
              className="w-full bg-blue-600 text-white py-2 cursor-pointer rounded-lg hover:bg-blue-700 transition"
            >
              {isAuthenticated ? 'Confirm Booking' : 'Login to Book'}
            </button>
          </>
        ) : (
          <p className="text-gray-500">Select seats to book</p>
        )}
        {!isAuthenticated && (
          <div className="mt-4 space-y-2">
            <button
              onClick={onLogin}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Login
            </button>
            <button
              onClick={onSignup}
              className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
}