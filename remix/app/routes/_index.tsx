import type { MetaFunction } from "@remix-run/node";
import Modal, { LoginButton } from "~/components/landing";
import React, { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "MediFlux" },
    { name: "description", content: "Welcome to MediFlux!" },
  ];
};

export default function Index() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const setIsModalOpenNot = () => setIsModalOpen((origin) => !origin);

  return (
    <div className="min-h-screen">
      <header className="min-h-24 font-playfair font-extrabold text-4xl flex items-center justify-between pl-12 pr-12">
        MediFlux
      </header>
      <div className="min-h-screen flex justify-center items-center bg-gray-200">
        <div className="flex max-w-screen-xl">
          <div className="bg-white rounded-lg shadow-lg p-8 font-noto">
            <h2 className="text-9xl font-bold font-playfair mb-10">
              Efficient care,
            </h2>
            <h2 className="text-9xl font-bold font-playfair mb-10">
              Every time
            </h2>
            <LoginButton onClose={setIsModalOpenNot} name="Get started" />
          </div>
        </div>
      </div>
      {isModalOpen && <Modal onClose={setIsModalOpenNot} />}
    </div>
  );
}
