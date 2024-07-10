import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/UserContext";
import { API_BASE_URL } from "../config";

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  let filteredUsers = users
    .filter(
      (u) =>
        u.username.toLowerCase().includes(filter.toLowerCase()) ||
        u.email.toLowerCase().includes(filter.toLowerCase())
    )
    .filter((u) => roleFilter === "all" || u.role === roleFilter);

  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        setError("Failed to fetch users");
        console.error(error);
      }
    };

    fetchUsers();
  }, [user, navigate]);

  const handleRoleChange = async (username, newRole) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${username}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await response.json();
      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.username === username ? { ...user, role: newRole } : user
          )
        );
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setError("Failed to update user role");
      console.error(error);
    }
  };

  return (
    <div>
      <header>
        <h1 className="mt-10 text-2xl font-bold mb-6 text-left dark:text-slate-200">
          Admin Dashboard
        </h1>
        {error && <p className="text-red-500">{error}</p>}
        <div className="mb-4">
          <label
            className="block text-gray-700 mb-2 dark:text-slate-400"
            htmlFor="users"
          >
            Filter Users
          </label>
          <input
            type="text"
            id="users"
            name="users"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded dark:bg-slate-800"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="roleFilter" className="mr-2 dark:text-slate-400">
            Filter by role
          </label>
          <select
            id="roleFilter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded dark:text-slate-400 dark:bg-slate-800"
          >
            <option value="all">All</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
        </div>
      </header>
      <div className="overflow-x-auto max-h-96">
        <table className="min-w-full bg-white dark:bg-slate-800">
          <thead className="bg-gray-200 sticky top-0 z-10 dark:bg-slate-600 dark:text-slate-200 text-left">
            <tr>
              <th className="py-2 px-4 border-b">Username</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Role</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody className="dark:text-slate-400">
            {filteredUsers.map((u) => (
              <tr key={u._id}>
                <td className="py-2 px-4 border-b">{u.username}</td>
                <td className="py-2 px-4 border-b">{u.email}</td>
                <td className="py-2 px-4 border-b">{u.role}</td>
                <td className="py-2 px-4 border-b">
                  <select
                    value={u.role}
                    onChange={(e) =>
                      handleRoleChange(u.username, e.target.value)
                    }
                    className="p-2 border cursor-pointer border-gray-300 rounded dark:bg-slate-800 dark:text-slate-400"
                    disabled={u.username === user.username}
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100 sticky bottom-0 z-10 dark:bg-slate-600 dark:text-slate-400">
            <tr>
              <td className="py-2 px-4 border-t" colSpan="4">
                {filteredUsers.length} results found
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
