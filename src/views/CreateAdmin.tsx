import { useState } from "react";
import { AdminApi } from "../lib/api";

export const CreateAdmin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await AdminApi.createAdmin({ email, password });
      setSuccess("Admin created successfully.");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-lg mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-black mb-4">Create Admin</h1>
      <p className="text-gray-600 mb-6">Only SUPER_ADMIN users can create new admins.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700">
            Admin Email
          </label>
          <input
            id="admin-email"
            type="email"
            placeholder="Enter admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md text-black placeholder-gray-400 focus:ring-2 focus:ring-black focus:border-black transition-colors"
            required
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700">
            Temporary Password
          </label>
          <input
            id="admin-password"
            type="password"
            placeholder="Enter temporary password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md text-black placeholder-gray-400 focus:ring-2 focus:ring-black focus:border-black transition-colors"
            required
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 py-2 px-4 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Creating..." : "Create Admin"}
          </button>
          {success && <span className="text-green-600 text-sm">{success}</span>}
        </div>
      </form>
      {error && <div className="mt-4 text-red-600 text-sm text-center">{error}</div>}
    </section>
  );
};