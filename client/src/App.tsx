import { useEffect, useState } from "react";

function App() {
  const [count, setCount] = useState(0);
  const [apiHealth, setApiHealth] = useState<string>("loading...");

  useEffect(() => {
    fetch("/api/health")
      .then(async (res) => {
        if (!res.ok) return `error (${res.status})`;
        const data = (await res.json()) as { status: string };
        return data.status;
      })
      .then(setApiHealth)
      .catch(() => setApiHealth("error"));
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12">
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
          <h1 className="text-2xl font-semibold">TemplateV2</h1>
          <p className="mt-2 text-sm text-slate-300">
            React + Vite + Tailwind + Express + Prisma + Postgres
          </p>
          <div className="mt-4 text-sm">
            <span className="text-slate-400">API health:</span>{" "}
            <span className="font-medium">{apiHealth}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-slate-300">Counter example</div>
            <button
              type="button"
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
              onClick={() => setCount((c) => c + 1)}
            >
              Count: {count}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
