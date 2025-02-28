"use client";
import { useState } from "react";

const youtubeVideos = [
  "https://www.youtube.com/embed/xRPjKQtRXR8?si=7bYWOwuHNme_0mR-&autoplay=1",
  "https://www.youtube.com/embed/u4UZ4UvZXrg?si=R5qWbUBwz52lSl9J&autoplay=1",
  "https://www.youtube.com/embed/DHUnz4dyb54?si=8vA1hyErs9H-qAxx&autoplay=1",
  "https://www.youtube.com/embed/yRrn1evVozA?si=K-uGnC2_fx1ZNxyS&autoplay=1",
];

const dummyCameras = [
  { id: 1, name: "Nasa" },
  { id: 2, name: "Ireland" },
  { id: 3, name: "Fish" },
  { id: 4, name: "Crane" },
];

const dummyEvents = [
  {
    id: 1,
    time: "12:30 PM",
    event: "Motion detected at Times Square",
    faceRecognized: "Unknown",
  },
  {
    id: 2,
    time: "12:15 PM",
    event: "Person detected at Miami Beach",
    faceRecognized: "John Doe",
  },
  {
    id: 3,
    time: "11:45 AM",
    event: "Crowd gathered at Las Vegas Strip",
    faceRecognized: "Unknown",
  },
];

const pastRecordings = [
  { id: 1, time: "11:00 AM", duration: "2 min", file: "recording_1.mp4" },
  { id: 2, time: "10:45 AM", duration: "5 min", file: "recording_2.mp4" },
];

export default function SecurityCameraUI() {
  const [selectedCamera, setSelectedCamera] = useState(dummyCameras[0]);
  const [nightVision, setNightVision] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const selectedVideoSrc = youtubeVideos[selectedCamera.id - 1];

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-white grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-8">
      {/* Camera Feed */}
      <div className="flex flex-col items-center">
        <h1 className="text-xl font-bold mb-4">{selectedCamera.name}</h1>
        <div
          className={`w-full max-w-2xl h-80 flex items-center justify-center border rounded-lg overflow-hidden ${
            nightVision ? "bg-gray-700" : "bg-black"
          }`}
        >
          <iframe
            src={selectedVideoSrc}
            width="100%"
            height="100%"
            className="w-full h-full"
            allowFullScreen
          ></iframe>
        </div>

        {/* Night Vision & Audio Controls */}
        <div className="flex gap-4 mt-4">
          <button
            className="p-2 bg-gray-700 rounded-lg"
            onClick={() => setNightVision(!nightVision)}
          >
            {nightVision ? "Disable Night Vision" : "Enable Night Vision"}
          </button>
          <button
            className="p-2 bg-gray-700 rounded-lg"
            onClick={() => setAudioEnabled(!audioEnabled)}
          >
            {audioEnabled ? "Mute Audio" : "Enable Audio"}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-6">
        {/* Camera Selection */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Cameras</h2>
          <div className="grid grid-cols-2 gap-4">
            {dummyCameras.map((camera) => (
              <button
                key={camera.id}
                className={`p-2 border rounded-lg transition-colors ${
                  selectedCamera.id === camera.id
                    ? "bg-gray-700"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
                onClick={() => setSelectedCamera(camera)}
              >
                {camera.name}
              </button>
            ))}
          </div>
        </div>

        {/* Event Log */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Recent Events</h2>
          <div className="bg-gray-800 p-4 rounded-lg h-48 overflow-y-auto border border-gray-700">
            {dummyEvents.map((event) => (
              <div key={event.id} className="mb-2 p-2 bg-gray-700 rounded-lg">
                <p className="text-sm font-semibold">{event.time}</p>
                <p className="text-sm">{event.event}</p>
                <p
                  className={`text-sm ${
                    event.faceRecognized === "Unknown"
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  Face: {event.faceRecognized}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Past Recordings */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Past Recordings</h2>
          <div className="bg-gray-800 p-4 rounded-lg h-40 overflow-y-auto border border-gray-700">
            {pastRecordings.map((rec) => (
              <div key={rec.id} className="mb-2 p-2 bg-gray-700 rounded-lg">
                <p className="text-sm font-semibold">
                  {rec.time} - {rec.duration}
                </p>
                <p className="text-sm text-blue-400 cursor-pointer">
                  Download {rec.file}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
