"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { motion } from "framer-motion";

type Habit = {
  text: string;
  done: boolean;
};

type Day = {
  name: string;
  habits: Habit[];
};

const initialDays: Day[] = [
  { name: "Monday", habits: ["Morning Run 🏃‍♂️", "Read 20 min 📚", "Meditate 🧘‍♂️"].map(h => ({ text: h, done: false })) },
  { name: "Tuesday", habits: ["Yoga 🧘‍♀️", "Write Journal ✍️", "Drink 2L Water 💧"].map(h => ({ text: h, done: false })) },
  { name: "Wednesday", habits: ["Gym 🏋️‍♂️", "Call a Friend 📞", "Cook Dinner 🍳"].map(h => ({ text: h, done: false })) },
  { name: "Thursday", habits: ["Stretching 🤸‍♂️", "Learn Coding 💻", "Walk 5k 🚶‍♂️"].map(h => ({ text: h, done: false })) },
  { name: "Friday", habits: ["Clean Desk 🧹", "Plan Weekend 🗓", "Read News 📰"].map(h => ({ text: h, done: false })) },
  { name: "Saturday", habits: ["Hike 🥾", "Photography 📸", "Try New Recipe 🍝"].map(h => ({ text: h, done: false })) },
  { name: "Sunday", habits: ["Meal Prep 🍱", "Family Time ❤️", "Relax ☕"].map(h => ({ text: h, done: false })) },
];

export default function Page() {
  const [days, setDays] = useState<Day[]>(initialDays);

  useEffect(() => {
    const saved = localStorage.getItem("habitProgress");
    if (saved) setDays(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("habitProgress", JSON.stringify(days));
  }, [days]);

  const toggleHabit = (dayIndex: number, habitIndex: number) => {
    setDays(prev => {
      const updated = [...prev];
      updated[dayIndex].habits[habitIndex].done = !updated[dayIndex].habits[habitIndex].done;
      return updated;
    });
  };

  return (
    <div className="max-w-md mx-auto py-6">
      <h1 className="text-3xl font-bold text-center mb-6">Habit Tracker</h1>

      <Swiper
        spaceBetween={20}
        slidesPerView={1}
        pagination={{ clickable: true }}
        modules={[Pagination]}
      >
        {days.map((day, dayIndex) => (
          <SwiperSlide key={day.name}>
            <motion.div
              className="p-6 bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-2xl font-semibold mb-4">{day.name}</h2>
              <div className="space-y-4">
                {day.habits.map((habit, habitIndex) => (
                  <motion.div
                    key={habitIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: habitIndex * 0.1 }}
                    className={`p-4 rounded-lg shadow-sm flex items-center justify-between transition ${
                      habit.done
                        ? "bg-green-100 border border-green-300"
                        : "bg-gradient-to-r from-gray-50 to-gray-100"
                    }`}
                  >
                    <span
                      className={`font-medium ${habit.done ? "line-through text-gray-500" : ""}`}
                    >
                      {habit.text}
                    </span>
                    <button
                      onClick={() => toggleHabit(dayIndex, habitIndex)}
                      className={`px-3 py-1 text-sm rounded-full transition ${
                        habit.done
                          ? "bg-gray-400 text-white hover:bg-gray-500"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                    >
                      {habit.done ? "Undo" : "Done"}
                    </button>
                  </motion.div>
                ))}
              </div>
           