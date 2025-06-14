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
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent opacity-50"></div>
        <h1 className="relative text-3xl font-black text-center mt-16 mb-8 tracking-wider uppercase animate-fade-in">
          <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent drop-shadow-lg hover:scale-105 transition-transform duration-300 inline-block">
            Sunrise Medical Hospital
          </span>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto mt-4 rounded-full"></div>
        </h1>
      </div>
      <div className='space-x-4'>
        <div className="max-w-full mx-auto my-8 rounded-lg shadow-lg overflow-hidden">
          <Swiper
            modules={[Autoplay]}
            loop={true}
            autoplay={{
              delay: 0,
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
            }}
            speed={10000}
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
        <DoctorList />
      </div>
    </main>
  );
}
