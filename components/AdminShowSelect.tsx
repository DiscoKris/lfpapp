"use client";

import { useState } from "react";

const shows = [
  { id: "oz", name: "The Winter of Oz" },
  { id: "sw", name: "A Snow White Christmas" },
  { id: "aladdin", name: "Aladdin" },
  { id: "peter-pan", name: "Peter Pan" },
  { id: "cinderella", name: "Cinderella" },
  { id: "sleeping-beauty", name: "Sleeping Beauty" },
];

type Props = {
  onSelect: (showId: string) => void;
};

export default function AdminShowSelect({ onSelect }: Props) {
  const [selected, setSelected] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setSelected(value);
    onSelect(value);
  }

  return (
    <div className="mb-6">
      <label htmlFor="showSelect" className="block mb-2 text-sm font-medium">
        Select Show
      </label>
      <select
        id="showSelect"
        value={selected}
        onChange={handleChange}
        className="w-full p-2 rounded bg-white/90 text-black"
      >
        <option value="">-- Choose a Show --</option>
        {shows.map((show) => (
          <option key={show.id} value={show.id}>
            {show.name}
          </option>
        ))}
      </select>
    </div>
  );
}
