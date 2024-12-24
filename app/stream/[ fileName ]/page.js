"use client";

import { useParams } from "next/navigation";

export default function StreamPage() {
  const { fileName } = useParams();

  if (!fileName) return <p>Loading...</p>;

  const streamUrl = `/api/stream/${fileName}`;
  const downloadUrl = `/api/download/${fileName}`;

  console.log("Streaming video from:", streamUrl);

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <h1 className="text-xl font-bold mb-4">Streaming: {fileName}</h1>
      <video controls className="w-full max-w-3xl mb-4">
        <source src={streamUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <a
        href={downloadUrl}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        download
      >
        Download
      </a>
    </div>
  );
}
