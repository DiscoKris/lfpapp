import DocumentList from "@/components/DocumentList";

const mockSchedules = [
  {
    id: "1",
    name: "Week 1 Schedule",
    url: "/docs/week1.pdf",
    uploadedAt: "2025-09-15",
  },
  {
    id: "2",
    name: "Tech Rehearsal",
    url: "/docs/tech-rehearsal.pdf",
    uploadedAt: "2025-09-20",
  },
];

export default function SchedulesPage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black text-white px-6 py-10">
      <h1 className="text-2xl font-bold text-center mb-2">The Wonderful Winter of Oz Schedules</h1>
      <p className="text-sm text-center text-gray-300 mb-6">{today}</p>

      <DocumentList title="" documents={mockSchedules} />
    </main>
  );
}
