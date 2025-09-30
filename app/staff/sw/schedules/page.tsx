"use client";


import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebaseConfig";


const storage = getStorage(app);


export default function StaffSchedulesPage() {
const { showId } = useParams();
const [schedules, setSchedules] = useState<{ name: string; url: string }[]>([]);


const showNames: Record<string, string> = {
sw: "Snow White",
oz: "The Winter of Oz",
aladdin: "Aladdin",
// Add more as needed
};


useEffect(() => {
if (!showId) return;


async function fetchSchedules() {
try {
const folderRef = ref(storage, `staff/${showId}/schedules`);
const res = await listAll(folderRef);


const files = await Promise.all(
res.items.map(async (itemRef) => ({
name: itemRef.name,
url: await getDownloadURL(itemRef),
}))
);


setSchedules(files);
} catch (err) {
console.error("Error loading schedules:", err);
}
}


fetchSchedules();
}, [showId]);


return (
<main className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black text-white px-6 py-10">
<h1 className="text-3xl font-bold text-center mb-8">
Schedules – {showNames[showId as string] || showId}
</h1>


{schedules.length === 0 ? (
<p className="text-center text-gray-300">No schedules uploaded yet.</p>
) : (
<ul className="space-y-4 max-w-md mx-auto">
{schedules.map((file) => (
<li key={file.name} className="bg-white/10 p-4 rounded-xl flex justify-between items-center">
<span>{file.name}</span>
<a
href={file.url}
target="_blank"
rel="noopener noreferrer"
className="bg-red-700 px-4 py-2 rounded hover:bg-red-600"
>
}