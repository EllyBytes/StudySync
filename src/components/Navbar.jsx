import { Link } from 'react-router-dom';

function Navbar({ isAuthenticated, onLogout }) {
  return (
    <nav className="bg-blue-600 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">
          Study Planner
        </Link>
        {isAuthenticated ? (
          <div className="space-x-4">
            <Link to="/" className="text-white hover:text-blue-200">
              Home
            </Link>
            <Link to="/schedule" className="text-white hover:text-blue-200">
              Schedule
            </Link>
            <Link to="/analysis" className="text-white hover:text-blue-200">
              Analysis
            </Link>
            <Link to="/pomodoro" className="text-white hover:text-blue-200">
              Pomodoro
            </Link>
            <button
              onClick={onLogout}
              className="text-white hover:text-blue-200"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="space-x-4">
            <Link to="/login" className="text-white hover:text-blue-200">
              Login
            </Link>
            <Link to="/register" className="text-white hover:text-blue-200">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;