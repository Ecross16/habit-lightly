"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function Home() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [activeDay, setActiveDay] = useState(0);

  useEffect(() => {
    const storedDay = localStorage.getItem("activeDay");
    if (storedDay) {
      setActiveDay(parseInt(storedDay, 10));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("activeDay", activeDay.toString());
  }, [activeDay]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Habit Tracker</h1>

      <Swiper
        spaceBetween={20}
        slidesPerView={1}
        onSlideChange={(swiper) => setActiveDay(swiper.activeIndex)}
        initialSlide={activeDay}
      >
        {days.map((day, index) => (
          <SwiperSlide key={day}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6 bg-white rounded-lg shadow-md text-center"
            >
              <h2 className="text-xl font-semibold">{day}</h2>
              <p className="mt-2 text-gray-600">Your habits for {day}</p>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Pagination dots */}
      <div className="flex gap-2 mt-4">
        {days.map((_, index) => (
          <span
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === activeDay ? "bg-blue-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </main>
  );
}