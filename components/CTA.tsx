import Image from "next/image";
import config from "@/config";
import Link from "next/link";

const CTA = () => {
  return (
    <div className="relative isolate overflow-hidden">
      <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Start building lasting habits together.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
            Create challenges, invite friends, and achieve your goals as a team. Group accountability makes you 65% more likely to succeed than going it alone.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/signin"
              className="rounded-md bg-brand-orange px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Get {config.appName}
            </Link>
          </div>
        </div>
      </div>
      <div
        className="absolute left-0 top-0 -z-10 h-full w-full"
        style={{
          background: `linear-gradient(to bottom, rgba(0, 128, 128, 0.8), rgba(0, 128, 128, 0.9))`,
        }}
      />
      <img
        src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2874&q=80"
        alt="Friends working on habits together"
        className="absolute left-0 top-0 -z-20 h-full w-full object-cover"
      />
    </div>
  );
};

export default CTA;
