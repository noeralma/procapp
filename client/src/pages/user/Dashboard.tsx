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
  approvals?: { action: string; comment?: string; createdAt: string }[];
}

const UserDashboard: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [month, setMonth] = useState<string>("");

  const [editValues, setEditValues] = useState<Record<number, Partial<Report>>>(
    {}
  );

  const handleEditChange = (
    id: number,
    field: keyof Report,
    value: string | number
  ) => {
    setEditValues((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSaveEdit = async (id: number) => {
    const changes = editValues[id];
    if (!changes) return;
    try {
      await api.put(`/reports/${id}/edit`, changes);
      setMessage("Report updated successfully");
      setEditValues((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      fetchReports();
    } catch {
      setMessage("Failed to update report");
    }
  };

  const fetchReports = useCallback(async () => {
    try {
      const data = await api.get<Report[]>(
        `/reports${month ? `?month=${month}` : ""}`
      );
      setReports(data);
    } catch {
      console.error("Failed to fetch reports");
    }
  }, [month]);

  useEffect(() => {
    const t = setTimeout(() => {
      void fetchReports();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchReports]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/reports", {
        title,
        description,
        amount,
      });
      setMessage("Report submitted successfully");
      setTitle("");
      setDescription("");
      setAmount("");
      fetchReports();
    } catch {
      setMessage("Failed to submit report");
    }
  };

  return (
    <Layout title="Dashboard" info={message || undefined}>
      <div className="flex items-center justify-end mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Filter by month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-2 py-1 border rounded"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Form Section */}
        <div className="p-6 bg-white rounded shadow">
          <h2 className="mb-4 text-lg font-bold">Submit New Report</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Submit Report
            </button>
          </form>
        </div>

        {/* List Section */}
        <div className="p-6 bg-white rounded shadow">
          <h2 className="mb-4 text-lg font-bold">My Reports</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Title
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Amount
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
                  <tr key={report.id}>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {report.editable ? (
                        <input
                          className="w-full px-2 py-1 border rounded"
                          value={editValues[report.id]?.title ?? report.title}
                          onChange={(e) =>
                            handleEditChange(report.id, "title", e.target.value)
                          }
                        />
                      ) : (
                        report.title
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {report.editable ? (
                        <input
                          type="number"
                          className="w-full px-2 py-1 border rounded"
                          value={editValues[report.id]?.amount ?? report.amount}
                          onChange={(e) =>
                            handleEditChange(
                              report.id,
                              "amount",
                              Number(e.target.value)
                            )
                          }
                        />
                      ) : (
                        `$${report.amount}`
                      )}
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
                      {report.editable ? (
                        <button
                          onClick={() => handleSaveEdit(report.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            const comment =
                              window.prompt("Describe the change needed") || "";
                            await api.post(
                              `/reports/${report.id}/request-change`,
                              { comment }
                            );
                            setMessage("Change request submitted");
                            void fetchReports();
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Request Change
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
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
      </div>
    </Layout>
  );
};

export default UserDashboard;
