import { useRouter } from "next/router";
import { useState } from "react";
import Navbar from "@/components/navbar";

export default function Home() {
  const router = useRouter();
  const [meetingId, setmeetingId] = useState("");

  const generateMeetingId = () => {
    const adjectives = ["happy", "quick", "bright", "calm", "dark"];
    const nouns = ["forest", "river", "mountain", "sky", "ocean"];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 100);

    return `${adjective}-${noun}-${number}`;
  };

  const joinRoom = () => {
    const meetingIdNew = meetingId || generateMeetingId();
    router.push(`/meet/${meetingIdNew}`);
  };

  const handleInputChange = (e) => {
    setmeetingId(e.target.value);
  };

  const joinCustomRoom = () => {
    router.push(`/meet/${meetingId}`);
  };

  return (
    <div className="h-[50rem] w-full dark:bg-black bg-white  dark:bg-dot-white/[0.2] bg-dot-black/[0.2] relative flex items-center justify-center">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <Navbar />
      <div className="flex flex-col w-full items-center">
        <div className="w-full text-center">
          <p className="text-4xl sm:text-7xl font-bold relative z-20 bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 py-8">
            Welcome to WebMett
          </p>
        </div>
        <div className="flex flex-col w-full text-center gap-y-5">
          <div className="text-2xl">
            <br />A video conferencing app
          </div>
          <div>Create or Join Meeting</div>
          <div className="flex justify-center items-center gap-x-10 mx-auto">
            <div className="flex-1">
              <div
                onClick={joinRoom}
                className="px-4 py-2 flex-none rounded-lg bg-blue-700 font-bold text-white uppercase transform hover:scale-105 transition-colors duration-200"
              >
                Create Meeting
              </div>
            </div>
            <div className="flex-1">
              <div className="flex gap-x-2">
                <input
                  placeholder="meeting-id"
                  value={meetingId}
                  onChange={(e) => handleInputChange(e)}
                  className="rounded-lg text-black p-2 "
                />
                <button
                  onClick={joinCustomRoom}
                  className="px-4 py-2 flex-none rounded-lg bg-blue-700 font-bold text-white uppercase transform hover:scale-105 transition-colors duration-200"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
