import { useState, useEffect } from "react";
import Head from "next/head";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SeatMap from "../SeatMap";
import BookingHistory from "../BookingHistory";
import AuthModal from "../AuthModal";
import BookingSummary from "../BookingSummary";

export default function LandingPage() {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [bookingHistory, setBookingHistory] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
      fetchBookingHistory(storedUser?.id);
    }
    loadSeats();
  }, []);

  const loadSeats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/seats", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok) {
        setSeats(data);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError("Failed to load seat data");
      toast.error("Failed to load seat data");
    }
  };

  const handleSeatSelect = (seat) => {
    if (seat.is_booked) return;
    setSelectedSeats((prev) => {
      if (prev.includes(seat.seat_number)) {
        return prev.filter((s) => s !== seat.seat_number);
      } else {
        return [...prev, seat.seat_number];
      }
    });
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      setAuthMode("login");
      return;
    }
    if (selectedSeats.length === 0) {
      setError("Please select at least one seat");
      toast.error("Please select at least one seat");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ seatNumbers: selectedSeats }),
      });
      const result = await res.json();
      if (res.ok) {
        setSelectedSeats([]);
        loadSeats();
        fetchBookingHistory(user.id);
        setError(null);
        toast.success("Seats booked successfully!");
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message || "Booking failed");
      toast.error(err.message || "Booking failed");
    }
  };

  const handleAuthSubmit = async (data, isLogin) => {
    try {
      const endpoint = isLogin
        ? "http://localhost:5000/api/auth/login"
        : "http://localhost:5000/api/auth/signup";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        setIsAuthenticated(true);
        setUser(result.user);
        setShowAuthModal(false);
        toast.success(
          isLogin ? "Login successful!" : "Account created successfully!"
        );
        if (isLogin) fetchBookingHistory(result.user.id);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
      toast.error(err.message || "Authentication failed");
    }
  };

  const fetchBookingHistory = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/bookings/my-bookings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setBookingHistory(data);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      toast.error("Error fetching booking history");
    }
  };

  const handleReset = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/seats/reset", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok) {
        setSelectedSeats([]);
        loadSeats();
        fetchBookingHistory(user.id);
        toast.success("All bookings have been reset");
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      toast.error(err.message || "Failed to reset bookings");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    setSelectedSeats([]);
    setBookingHistory([]);
    toast.info("Logged out successfully");
  };

  const totalSeats = seats.length;
  const bookedSeats = seats.filter((seat) => seat.is_booked).length;
  const availableSeats = totalSeats - bookedSeats;

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://chennaimetrorail.org/wp-content/uploads/2023/12/cmrl-7.jpg')",
      }}
    >
      <Head>
        <title>Train Seat Booking</title>
        <meta name="description" content="Book train seats online" />
      </Head>

      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-7xl mx-auto p-4 md:p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-lg min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-600 p-6 rounded-xl text-white shadow-lg mb-6 animate-slideDown">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <span className="text-4xl animate-trainMove">🚂</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Train Seat Booking App
                </h1>
                <p className="mt-1 text-blue-100">
                  Book your journey with ease
                </p>
              </div>
            </div>
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        {isAuthenticated ? (
          <div className="space-y-6">
            {/* Seat Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-lg text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="text-lg font-semibold">Total Seats</h3>
                <p className="text-3xl font-bold mt-2">{totalSeats}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-lg text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="text-lg font-semibold">Available Seats</h3>
                <p className="text-3xl font-bold mt-2">{availableSeats}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 rounded-lg text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="text-lg font-semibold">Booked Seats</h3>
                <p className="text-3xl font-bold mt-2">{bookedSeats}</p>
              </div>
            </div>

            {/* Seat Map and Booking Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <SeatMap
                  seats={seats}
                  selectedSeats={selectedSeats}
                  onSeatSelect={handleSeatSelect}
                  onReset={handleReset}
                  user={user}
                />
              </div>
              <BookingSummary
                selectedSeats={selectedSeats}
                seats={seats}
                onBook={handleBooking}
                isAuthenticated={isAuthenticated}
                onLogin={() => {
                  setShowAuthModal(true);
                  setAuthMode("login");
                }}
                onSignup={() => {
                  setShowAuthModal(true);
                  setAuthMode("signup");
                }}
              />
            </div>

            {/* Booking History */}
            <div className="lg:col-span-4">
              <BookingHistory
                history={bookingHistory}
                seats={seats}
                user={user}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-lg shadow-md animate-fadeIn">
            <div className="max-w-md mx-auto">
              <h2 className="text-3xl font-bold mb-4 text-gray-800 flex items-center justify-center">
                <span className="mr-2">👋</span> Welcome to Train Seat Booking
              </h2>
              <p className="mb-8 text-gray-600">
                Please login or create an account to book seats on our train.
                You can book up to 7 seats at a time with priority given to
                complete rows.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    setAuthMode("login");
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    setAuthMode("signup");
                  }}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-all duration-300 transform hover:scale-105"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Auth Modal */}
        {showAuthModal && (
          <AuthModal
            mode={authMode}
            onClose={() => setShowAuthModal(false)}
            onSubmit={handleAuthSubmit}
            switchMode={(mode) => setAuthMode(mode)}
          />
        )}
      </div>
    </div>
  );
}
