import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const CustomerDashboard = () => {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100">

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Customer Dashboard
            </h1>

            <p className="text-sm text-slate-500">
              Welcome, {user?.full_name}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>

        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">

        <div className="bg-white rounded-xl shadow-sm p-6">

          <h2 className="text-xl font-semibold mb-4">
            Customer Information
          </h2>

          <div className="space-y-2 text-slate-700">
            <p>
              <strong>Name:</strong> {user?.full_name}
            </p>

            <p>
              <strong>Email:</strong> {user?.email}
            </p>

            <p>
              <strong>Role:</strong> {user?.role?.role_name}
            </p>
          </div>

        </div>

      </main>

    </div>
  );
};

export default CustomerDashboard;