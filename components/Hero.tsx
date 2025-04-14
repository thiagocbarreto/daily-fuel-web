import Link from "next/link";
import Image from "next/image";
import TestimonialsAvatars from "./TestimonialsAvatars";
import config from "@/config";

const Hero = () => {
  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
      <div className="mx-auto max-w-7xl py-32">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Build habits together, celebrate success as a group
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Create shared challenges, track group progress, and hold each other accountable - because the best habits are built together.
            </p>
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-x-6">
              <Link
                href="/signin"
                className="rounded-md bg-brand-teal px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-teal/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Start a group challenge
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2">
            <Image
              src="/images/group-collaboration.png"
              alt="Group of people collaborating on a challenge"
              className="w-full rounded-xl shadow-lg"
              priority={true}
              width={1200}
              height={800}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
