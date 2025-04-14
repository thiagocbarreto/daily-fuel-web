import { Check, Star, Users, Share2, Trophy, Bell } from "lucide-react";

const features = [
  {
    name: "Group Challenges",
    description:
      "Create and join challenges with friends, family, or colleagues to build habits together and boost motivation through friendly competition.",
    icon: Users,
  },
  {
    name: "Shared Accountability",
    description:
      "Stay on track with group accountability. Members can view each other's progress and send encouragement when someone needs motivation.",
    icon: Share2,
  },
  {
    name: "Leaderboards & Rewards",
    description:
      "Track your group's progress with interactive leaderboards and celebrate achievements together with virtual rewards and badges.",
    icon: Trophy,
  },
  {
    name: "Social Notifications",
    description:
      "Get notified when friends complete their tasks, reach milestones, or need support - making habit building a truly social experience.",
    icon: Bell,
  },
  {
    name: "Daily Reminders",
    description:
      "Customizable reminders for you and your group to help everyone stay on track with their habit commitments.",
    icon: Check,
  },
  {
    name: "Habit Streaks",
    description:
      "Build momentum with streaks that track consecutive days of habit completion for both individuals and groups.",
    icon: Star,
  },
];

export default function Features() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-brand-teal">Build habits faster</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to succeed together
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            DailyFuel transforms habit-building into a social experience. Create challenges with friends, track progress together, and celebrate collective wins.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-teal">
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
} 