import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../lib/api";
import Layout from "../../components/Layout";

interface Report {
  id: number;
  title: string;
  description: string;
  amount: number;
  status: string;
  editable?: boolean;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  approvals?: {
    action: string;
    comment?: string;
    createdAt: string;
    actorId: number;
  }[];
}

interface Stats {
  totalReports: number;
  pendingReports: number;
  approvedReports: number;
  rejectedReports: number;
  totalAmount: number;
}

const AdminDashboard: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [month, setMonth] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      const [reportsData, statsData] = await Promise.all([
        api.get<Report[]>(`/reports${month ? `?month=${month}` : ""}`),
        api.get<Stats>(`/reports/dashboard${month ? `?month=${month}` : ""}`),
      ]);
      setReports(reportsData);
      setStats(statsData);
    } catch {
      console.error("Failed to fetch admin data");
    }
  }, [month]);

  useEffect(() => {
    const t = setTimeout(() => {
      void fetchData();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchData]);

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      const comment = window.prompt("Add a comment (optional)") || "";
      await api.put(`/reports/${id}`, { status, comment });
      fetchData();
    } catch {
      console.error("Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this report?")) {
      try {
        await api.delete(`/reports/${id}`);
        fetchData();
      } catch {
        console.error("Failed to delete report");
      }
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000/api"
        }/reports/export${month ? `?month=${month}` : ""}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reports.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      console.error("Failed to export CSV");
    }
  };

  return (
    <Layout title="Dashboard" info="Surat perjanjian sudah diunggah.">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Filter by month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-2 py-1 border rounded"
          />
        </div>
        <button
          onClick={handleExport}
          className="px-3 py-2 text-white bg-gray-800 rounded"
        >
          Export CSV
        </button>
      </div>
      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Reports</h3>
          <p className="text-2xl font-bold">{stats?.totalReports || 0}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-sm font-medium text-gray-500">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {stats?.pendingReports || 0}
          </p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-sm font-medium text-gray-500">Approved</h3>
          <p className="text-2xl font-bold text-green-600">
            {stats?.approvedReports || 0}
          </p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
          <p className="text-2xl font-bold">${stats?.totalAmount || 0}</p>
        </div>
      </div>

      {/* Reports Table */}
      <div className="p-6 bg-white rounded shadow">
        <h2 className="mb-4 text-lg font-bold">Incoming Reports</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Last Comment
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr
                  key={report.id}
                  className={report.status === "PENDING" ? "bg-yellow-50" : ""}
                >
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    <div className="font-medium">
                      {report.user.name || "Unknown"}
                    </div>
                    <div className="text-gray-500">{report.user.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {report.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    ${report.amount}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        report.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : report.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {report.approvals && report.approvals.length > 0
                      ? report.approvals[0].comment || ""
                      : ""}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                    {report.status === "PENDING" && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusUpdate(report.id, "APPROVED")
                          }
                          className="mr-2 text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(report.id, "REJECTED")
                          }
                          className="mr-2 text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={async () => {
                        const comment =
                          window.prompt("Note to user (optional)") || "";
                        await api.post(`/reports/${report.id}/grant-edit`, {
                          comment,
                        });
                        fetchData();
                      }}
                      className="mr-2 text-indigo-600 hover:text-indigo-900"
                    >
                      Allow Edit
                    </button>
                    <button
                      onClick={async () => {
                        const comment =
                          window.prompt("Reason to deny (optional)") || "";
                        await api.post(`/reports/${report.id}/deny-change`, {
                          comment,
                        });
                        fetchData();
                      }}
                      className="mr-2 text-gray-600 hover:text-gray-900"
                    >
                      Deny Change
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
