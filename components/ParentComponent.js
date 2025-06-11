import { useState, useEffect } from 'react';
import AuthModal from './AuthModal';
import SeatMap from './SeatMap';
import BookingHistory from './BookingHistory.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ParentComponent() {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);

  // Initialize seats
  useEffect(() => {
    const initialSeats = [];
    let seatNumber = 1;
    
    // Create 11 rows (10 full rows + 1 partial row)
    for (let row = 1; row <= 11; row++) {
      const seatsInRow = row === 11 ? 3 : 7;
      const rowSeats = [];
      
      for (let col = 1; col <= seatsInRow; col++) {
        rowSeats.push({
          id: seatNumber++,
          row,
          col,
          booked: false,
          bookedBy: null
        });
      }
      
      initialSeats.push(rowSeats);
    }
    
    setSeats(initialSeats);
  }, []);

  const handleAuthSubmit = async (data, isLogin) => {
    setLoading(true);
    
    try {
      const endpoint = isLogin ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/signup';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', result.token);
        setUser(result.user);
        setShowModal(false);
        toast.success(isLogin ? 'Login successful!' : 'Account created successfully!');
        
        // Load user's booking history after login
        if (isLogin) {
          fetchBookingHistory(result.user.id);
        }
      } else {
        toast.error(result.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Network error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingHistory = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings?userId=${userId}`);
      const data = await response.json();
      if (response.ok) {
        setBookingHistory(data);
      }
    } catch (error) {
      console.error('Error fetching booking history:', error);
    }
  };

  const handleSeatSelection = (seat) => {
    if (seat.booked) return;
    
    setSelectedSeats(prev => {
      if (prev.some(s => s.id === seat.id)) {
        return prev.filter(s => s.id !== seat.id);
      } else {
        if (prev.length >= 7) {
          toast.warning('You can select up to 7 seats at a time');
          return prev;
        }
        return [...prev, seat];
      }
    });
  };

  const bookSelectedSeats = async () => {
    if (!selectedSeats.length) {
      toast.warning('Please select at least one seat');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          userId: user.id,
          seatIds: selectedSeats.map(s => s.id)
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Update seats state
        setSeats(prevSeats => 
          prevSeats.map(row => 
            row.map(seat => 
              selectedSeats.some(s => s.id === seat.id) 
                ? { ...seat, booked: true, bookedBy: user.id }
                : seat
            )
          )
        );
        
        setSelectedSeats([]);
        toast.success('Seats booked successfully!');
        fetchBookingHistory(user.id);
      } else {
        toast.error(result.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Error booking seats');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => setShowModal(false);
  const openLoginModal = () => { setModalMode('login'); setShowModal(true); };
  const openSignupModal = () => { setModalMode('signup'); setShowModal(true); };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setSelectedSeats([]);
    toast.info('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-3xl font-bold">🚂 Train Seat Booking App</h1>
          <p className="mt-2">Book your train seats with ease</p>
        </div>
        
        {/* Main Content */}
        <div className="p-6">
          {user ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User Info */}
              <div className="lg:col-span-1 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-semibold">{user.username}</h2>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                
                <button style={{cursor:'pointer'}}
                  onClick={handleLogout}
                  className="w-full py-2  bg-red-500 text-white rounded  hover:bg-red-600 transition"
                >
                  Logout
                </button>
                
                {selectedSeats.length > 0 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <h3 className="font-medium mb-2">Selected Seats ({selectedSeats.length})</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedSeats.map(seat => (
                        <span key={seat.id} className="px-2 py-1 bg-yellow-100 rounded">
                          Seat {seat.id} (Row {seat.row}, Col {seat.col})
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={bookSelectedSeats}
                      disabled={loading}
                      className="w-full py-2 cursor-pointer bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition"
                    >
                      {loading ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  </div>
                )}
              </div>
              
              {/* Seat Map */}
              <div className="lg:col-span-2">
                <SeatMap 
                  seats={seats} 
                  selectedSeats={selectedSeats.map(s => s.id)}
                  onSeatClick={handleSeatSelection}
                  user={user}
                />
              </div>
              
              {/* Booking History */}
              <div className="lg:col-span-3">
                <BookingHistory 
                  history={bookingHistory} 
                  seats={seats.flat()} 
                  user={user}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <h2 className="text-2xl font-bold mb-4">Welcome to Train Seat Booking</h2>
                <p className="mb-8 text-gray-600">
                  Please login or create an account to book seats on our train. 
                  You can book up to 7 seats at a time with priority given to complete rows.
                </p>
                
                <div className="flex justify-center space-x-4">
                  <button 
                    onClick={openLoginModal} 
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Login
                  </button>
                  <button 
                    onClick={openSignupModal} 
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      {showModal && (
        <AuthModal
          mode={modalMode}
          onClose={handleCloseModal}
          onSubmit={handleAuthSubmit}
          loading={loading}
        />
      )}
    </div>
  );
}