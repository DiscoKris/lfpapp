"use client";

import { useState } from "react";

type UpcomingShow = {
  id: string;
  title: string;
  city: string;
  dates: string;
  logo: string; // URL
  still?: string; // optional still image
  link: string;
  status: "active" | "inactive";
};

export default function AdminUpcomingShowsPage() {
  const [shows, setShows] = useState<UpcomingShow[]>([]);
  const [form, setForm] = useState({
    title: "",
    city: "",
    dates: "",
    logo: "",
    still: "",
    link: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleAddShow(e: React.FormEvent) {
    e.preventDefault();
    const newShow: UpcomingShow = {
      id: Date.now().toString(),
      ...form,
      status: "inactive", // default to inactive
    };
    setShows([...shows, newShow]);
    setForm({ title: "", city: "", dates: "", logo: "", still: "", link: "" });
  }

  function toggleStatus(id: string) {
    setShows((prev) =>
      prev.map((show) =>
        show.id === id
          ? { ...show, status: show.status === "active" ? "inactive" : "active" }
          : show
      )
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Admin – Upcoming Shows</h1>

      {/* Add new show */}
      <form
        onSubmit={handleAddShow}
        className="bg-black/50 p-6 rounded-xl max-w-md mx-auto space-y-4 shadow-lg"
      >
        <input
          type="text"
          name="title"
          placeholder="Show Title"
          value={form.title}
          onChange={handleChange}
          className="w-full p-2 rounded bg-white/90 text-black"
          required
        />
        <input
          type="text"
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
          className="w-full p-2 rounded bg-white/90 text-black"
          required
        />
        <input
          type="text"
          name="dates"
          placeholder="Dates (e.g. Dec 10–24, 2025)"
          value={form.dates}
          onChange={handleChange}
          className="w-full p-2 rounded bg-white/90 text-black"
          required
        />
        <input
          type="text"
          name="logo"
          placeholder="Logo URL"
          value={form.logo}
          onChange={handleChange}
          className="w-full p-2 rounded bg-white/90 text-black"
          required
        />
        <input
          type="text"
          name="still"
          placeholder="Still Image URL (optional)"
          value={form.still}
          onChange={handleChange}
          className="w-full p-2 rounded bg-white/90 text-black"
        />
        <input
          type="url"
          name="link"
          placeholder="More Info / Ticket Link"
          value={form.link}
          onChange={handleChange}
          className="w-full p-2 rounded bg-white/90 text-black"
          required
        />
        <button
          type="submit"
          className="w-full bg-red-700 hover:bg-red-600 py-2 rounded font-semibold"
        >
          Add Show
        </button>
      </form>

      {/* Show list */}
      <div className="mt-10 max-w-md mx-auto space-y-6">
        {shows.map((show) => (
          <div
            key={show.id}
            className={`p-4 rounded-xl shadow-lg ${
              show.status === "inactive" ? "bg-black/30 opacity-60" : "bg-black/60"
            }`}
          >
            <div className="flex items-center gap-4">
              <img
                src={show.logo}
                alt={show.title}
                className="w-16 h-16 object-contain rounded"
              />
              <div className="flex-1">
                <h2 className="text-lg font-bold">{show.title}</h2>
                <p className="text-sm opacity-80">{show.city}</p>
                <p className="text-sm">{show.dates}</p>
                <a
                  href={show.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline text-sm"
                >
                  More Info
                </a>
              </div>
              {/* Toggle Active/Inactive */}
              <button
                onClick={() => toggleStatus(show.id)}
                className={`px-3 py-1 rounded text-sm font-semibold ${
                  show.status === "active"
                    ? "bg-green-600 hover:bg-green-500"
                    : "bg-gray-600 hover:bg-gray-500"
                }`}
              >
                {show.status === "active" ? "Active" : "Inactive"}
              </button>
            </div>

            {/* Optional Still Image */}
            {show.still && (
              <div className="mt-4">
                <img
                  src={show.still}
                  alt={`${show.title} Still`}
                  className="w-full rounded-lg object-cover max-h-40"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
