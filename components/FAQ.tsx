"use client";

import config from "@/config";
import { useRef, useState } from "react";
import type { JSX } from "react";

// <FAQ> component is a lsit of <Item> component
// Just import the FAQ & add your FAQ content to the const faqList arrayy below.

interface FAQItemProps {
  question: string;
  answer: JSX.Element;
}

const faqList: FAQItemProps[] = [
  {
    question: "What is DailyFuel?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>
          DailyFuel is a minimalist challenge-based app where you can create and join X-day challenges to build habits and stay accountable. Whether it&apos;s &quot;30 days of writing&quot; or &quot;14 days of workouts,&quot; DailyFuel helps you track your progress and build consistency.
        </p>
      </div>
    ),
  },
  {
    question: "What's the difference between free and paid plans?",
    answer: (
      <p>
        Free users can join challenges and track their progress but cannot create challenges. Subscribers (${config.stripe.plans[0].price}/month or ${config.stripe.plans[1].price}/year) can create unlimited challenges and share them with anyone, plus get access to participation statistics.
      </p>
    ),
  },
  {
    question: "How do I create a challenge?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>
          To create a challenge, you need to be a subscriber. Once subscribed, simply:
        </p>
        <ol className="list-decimal pl-4">
          <li>Go to your dashboard</li>
          <li>Click &quot;Create Challenge&quot;</li>
          <li>Enter the title, description, and duration</li>
          <li>Share the generated link with anyone you want to join</li>
        </ol>
      </div>
    ),
  },
  {
    question: "Can I cancel my subscription?",
    answer: (
      <p>
        Yes, you can cancel your subscription at any time. If you cancel, you&apos;ll still have access to subscriber features until the end of your billing period. For yearly subscriptions, we don&apos;t offer prorated refunds for partial usage.
      </p>
    ),
  },
  {
    question: "How do I join someone else's challenge?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>Simply click the challenge link they shared with you. If you&apos;re not logged in, you&apos;ll be prompted to sign in or create an account. Once logged in, you&apos;ll be back on the join page so that you can start tracking your progress.</p>
      </div>
    ),
  },
];

const FaqItem = ({ item }: { item: FAQItemProps }) => {
  const accordion = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li>
      <button
        className="relative flex gap-2 items-center w-full py-5 text-base font-semibold text-left border-t md:text-lg border-base-content/10"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
      >
        <span
          className={`flex-1 text-base-content ${isOpen ? "text-primary" : ""}`}
        >
          {item?.question}
        </span>
        <svg
          className={`flex-shrink-0 w-4 h-4 ml-auto fill-current`}
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center transition duration-200 ease-out ${
              isOpen && "rotate-180"
            }`}
          />
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center rotate-90 transition duration-200 ease-out ${
              isOpen && "rotate-180 hidden"
            }`}
          />
        </svg>
      </button>

      <div
        ref={accordion}
        className={`transition-all duration-300 ease-in-out opacity-80 overflow-hidden`}
        style={
          isOpen
            ? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
            : { maxHeight: 0, opacity: 0 }
        }
      >
        <div className="pb-5 leading-relaxed">{item?.answer}</div>
      </div>
    </li>
  );
};

const FAQ = () => {
  return (
    <section className="bg-base-200" id="faq">
      <div className="py-24 px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
        <div className="flex flex-col text-left basis-1/2">
          <p className="inline-block font-semibold text-primary mb-4">FAQ</p>
          <p className="sm:text-4xl text-3xl font-extrabold text-base-content">
            Frequently Asked Questions
          </p>
        </div>

        <ul className="basis-1/2">
          {faqList.map((item, i) => (
            <FaqItem key={i} item={item} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FAQ;
