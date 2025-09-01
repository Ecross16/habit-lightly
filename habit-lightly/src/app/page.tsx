"use client";

import Image from "next/image";
import { getMessageForUser } from "@/lib/bandit";
import { useEffect, useState } from "react";

export default function Home() {
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");

  const generateNewId = () => {
    const newId = Math.random().toString(36).substring(2, 8);
    localStorage.setItem("userId", newId);
    setUserId(newId);
    setMessage(getMessageForUser(newId));
  };

  useEffect(() => {
    let storedId = localStorage.getItem("userId");
    if (!storedId) {
      storedId = Math.random().toString(36).substring(2, 8);
      localStorage.setItem("userId", storedId);
    }
    setUserId(storedId);
    setMessage(getMessageForUser(storedId));
  }, []);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <h2 className="text-lg font-semibold text-center sm:text-left text-indigo-600">
          {message}
        </h2>
        <button
          onClick={generateNewId}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          Change My Vibe
        </button>
        {/* Rest of your layout here... */}
      </main>
      {/* Footer and other content... */}
    </div>
  );
}