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
  return <DocumentList title="The Wonderful Winter of Oz Technical" documents={mockSchedules} />;
}
