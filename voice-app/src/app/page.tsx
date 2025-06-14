'use client';

import DoctorList from '@/components/DoctorList';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import Image from 'next/image';
import 'swiper/css';

const images = [
  {
    src: '/images/hospital-2.jpg',
    alt: 'Modern Hospital Building',
  },
  {
    src: '/images/hospital-1.jpg',
    alt: 'Hospital Interior',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div>
        {/* 🔁 Autoplaying Hospital Carousel */}
        <div className="max-w-full mx-auto my-8 rounded-lg shadow-lg overflow-hidden">
          <Swiper
            modules={[Autoplay]}
            loop={true}
            autoplay={{
              delay: 0, // ⚡️ No delay between slides
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
            }}
            speed={10000} // 🕒 Slide speed in milliseconds
            slidesPerView={1}
            direction="horizontal"
          >
            {images.map((image, index) => (
              <SwiperSlide key={index}>
                <div className="relative h-[500px] w-full">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-contain"
                    priority={index === 0}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Doctor Carousel */}
        <DoctorList />
      </div>
    </main>
  );
}
