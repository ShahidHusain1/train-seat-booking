import { useState } from 'react';
import { toast } from 'react-toastify';

export default function SeatMap({ seats, selectedSeats, onSeatSelect, onReset, user }) {
  const [seatCountInput, setSeatCountInput] = useState('');

  const bookedSeats = seats.filter(s => s.is_booked).length;
  const availableSeats = seats.length - bookedSeats;

  // Group seats by row
  const rows = {};
  seats.forEach(seat => {
    if (!rows[seat.row_number]) rows[seat.row_number] = [];
    rows[seat.row_number].push(seat);
  });

  const handleAutoBook = () => {
    const numSeats = parseInt(seatCountInput, 10);

    // Validate input
    if (isNaN(numSeats) || numSeats < 1) {
      toast.error('Please enter a number greater than 0');
      return;
    }

    if (numSeats > 7) {
      toast.error('You can book up to 7 seats at a time');
      return;
    }

    if (numSeats > availableSeats) {
      if (availableSeats === 0) {
        toast.error('No seats available to book');
        return;
      }
      toast.error(`${numSeats} seats are not available`);
    }

    const seatsToBook = Math.min(numSeats, availableSeats, 7);
    let seatsBooked = [];

    // Sort rows by row number in ascending order (prioritize top rows for single-row booking)
    const sortedRowNumbers = Object.keys(rows)
      .map(Number)
      .sort((a, b) => a - b);

    // Step 1: Try to book in a single row (starting from the top)
    for (const rowNumber of sortedRowNumbers) {
      const rowSeats = rows[rowNumber];
      const availableInRow = rowSeats.filter(seat => !seat.is_booked && !selectedSeats.includes(seat.seat_number));
      if (availableInRow.length >= seatsToBook) {
        seatsBooked = availableInRow.slice(0, seatsToBook).map(seat => seat.seat_number);
        break;
      }
    }

    // Step 2: If not enough seats in a single row, find the smallest set of consecutive rows
    if (seatsBooked.length === 0) {
      let bestSelection = [];
      let minRowSpan = Infinity;
      let lowestStartingRow = Infinity;

      // Try each possible starting row (from top to bottom)
      for (let i = 0; i < sortedRowNumbers.length; i++) {
        let currentSeats = [];
        let remainingSeats = seatsToBook;
        let rowSpan = 0;
        let startRow = sortedRowNumbers[i];

        // Check consecutive rows starting from sortedRowNumbers[i] (in ascending order)
        for (let j = i; j < sortedRowNumbers.length && remainingSeats > 0; j++) {
          const rowNumber = sortedRowNumbers[j];
          // Ensure rows are consecutive
          if (j > i && rowNumber !== sortedRowNumbers[j - 1] + 1) break;
          const rowSeats = rows[rowNumber];
          const availableInRow = rowSeats.filter(seat => !seat.is_booked && !selectedSeats.includes(seat.seat_number));
          const seatsToTake = Math.min(remainingSeats, availableInRow.length);
          const rowSeatsBooked = availableInRow.slice(0, seatsToTake).map(seat => seat.seat_number);
          currentSeats.push(...rowSeatsBooked);
          remainingSeats -= seatsToTake;
          rowSpan = rowNumber - sortedRowNumbers[i] + 1; // Calculate row span
        }

        // Update best selection if we booked enough seats and row span is smaller or equal
        // Prioritize combinations with lower starting row numbers if row spans are equal
        if (remainingSeats === 0 && (rowSpan < minRowSpan || (rowSpan === minRowSpan && startRow < lowestStartingRow))) {
          bestSelection = currentSeats;
          minRowSpan = rowSpan;
          lowestStartingRow = startRow;
        }
      }

      seatsBooked = bestSelection;

      if (seatsBooked.length < seatsToBook) {
        toast.warning(`Could not book all ${seatsToBook} seats. Booked ${seatsBooked.length} seats.`);
      } else if (seatsToBook > 0) {
        const selectedRows = [...new Set(seatsBooked.map(seatNumber => {
          const seat = seats.find(s => s.seat_number === seatNumber);
          return seat.row_number;
        }))].sort((a, b) => a - b);
        if (!numSeats > availableSeats) {
          toast.info(`Booked ${seatsBooked.length} seats in Row${selectedRows.length > 1 ? 's' : ''} ${selectedRows.join(' and ')}.`);
        }
      }
    } else {
      toast.success(`Successfully selected ${seatsBooked.length} seats in Row ${sortedRowNumbers.find(row => rows[row].some(seat => seatsBooked.includes(seat.seat_number)))}!`);
    }

    // Update selected seats by calling onSeatSelect for each seat
    seatsBooked.forEach(seatNumber => {
      const seat = seats.find(s => s.seat_number === seatNumber);
      if (seat && !seat.is_booked && !selectedSeats.includes(seat.seat_number)) {
        onSeatSelect(seat);
      }
    });

    setSeatCountInput(''); // Clear input after booking
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">🚂 Train Seat Reservation</h2>

      {/* Input for Auto-Booking */}
      <div className="mb-6 flex justify-center items-center gap-3 animate-fadeIn">
        <input
          type="number"
          min="1"
          max="7"
          value={seatCountInput}
          onChange={(e) => setSeatCountInput(e.target.value)}
          placeholder="Enter number of seats (1-7)"
          className="w-40 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
        />
        <button
          onClick={handleAutoBook}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-300 transform cursor-pointer hover:scale-105"
        >
          Auto-Book
        </button>
      </div>

      {/* Seat Grid */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          {Object.entries(rows).sort(([a], [b]) => a - b).map(([rowNumber, rowSeats]) => (
            <div key={rowNumber} className="flex items-center mb-3">
              <div className="w-16 font-semibold text-gray-700">Row {rowNumber}</div>
              <div className="flex gap-2">
                {rowSeats.map(seat => (
                  <div
                    key={seat.seat_number}
                    onClick={() => !seat.is_booked && onSeatSelect(seat)}
                    className={`w-12 h-12 flex items-center justify-center rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 ${
                      seat.is_booked
                        ? seat.booked_by === user?.username
                          ? 'bg-yellow-400 text-black'
                          : 'bg-red-500 text-white cursor-not-allowed'
                        : selectedSeats.includes(seat.seat_number)
                        ? 'bg-blue-500 text-white'
                        : 'bg-green-500 text-white cursor-pointer'
                    }`}
                    title={seat.is_booked ? `Booked by ${seat.booked_by || 'someone'}` : 'Available'}
                  >
                    {seat.seat_number}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seat Status */}
      <div className="mt-4 flex gap-4 justify-center text-sm">
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 bg-yellow-400 mr-2 rounded"></span>
          <span>Booked Seats: {bookedSeats}</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 bg-green-500 mr-2 rounded"></span>
          <span>Available Seats: {availableSeats}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 text-sm text-gray-600 flex justify-center gap-4 flex-wrap">
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 bg-green-500 mr-2 rounded"></span>
          Available
        </div>
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 bg-blue-500 mr-2 rounded"></span>
          Selected
        </div>
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 bg-yellow-400 mr-2 rounded"></span>
          Your Booking
        </div>
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 bg-red-500 mr-2 rounded"></span>
          Booked by Others
        </div>
      </div>

      {/* Reset Button */}
      {user && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={onReset}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 cursor-pointer"
          >
            Reset All Bookings
          </button>
        </div>
      )}
    </div>
  );
}