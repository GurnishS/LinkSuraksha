"use client";
import React from "react";

import { ContainerScroll } from "../components/ui/container-scroll-animation";
export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-black dark:text-black">
              Make Silent Payments
              <br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none  text-blue-500">
                Get Loud Protection
              </span>
            </h1>
          </>
        }
      >
        <img
          src="./dashboard.png"
          alt="hero"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-left-top"
          draggable={false}
        />
      </ContainerScroll>
    </div>
  );
}
