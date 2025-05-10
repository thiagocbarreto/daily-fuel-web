import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

// CHATGPT PROMPT TO GENERATE YOUR TERMS & SERVICES — replace with your own data 👇

// 1. Go to https://chat.openai.com/
// 2. Copy paste bellow
// 3. Replace the data with your own (if needed)
// 4. Paste the answer from ChatGPT directly in the <pre> tag below

// You are an excellent lawyer.

// I need your help to write a simple Terms & Services for my website. Here is some context:
// - Website: https://dailyfuel.app
// - Name: DailyFuel
// - Contact information: thiago@dailyfuel.app
// - Description: A JavaScript code boilerplate to help entrepreneurs launch their startups faster
// - Ownership: when buying a package, users can download code to create apps. They own the code but they do not have the right to resell it. They can ask for a full refund within 7 day after the purchase.
// - User data collected: name, email and payment information
// - Non-personal data collection: web cookies
// - Link to privacy-policy: https://dailyfuel.app/privacy-policy
// - Governing Law: Brazil
// - Updates to the Terms: users will be updated by email

// Please write a simple Terms & Services for my site. Add the current date. Do not add or explain your reasoning. Answer:

export const metadata = getSEOTags({
  title: `Terms and Conditions | ${config.appName}`,
  canonicalUrlRelative: "/tos",
});

const TOS = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <Link href="/" className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Terms and Conditions for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Effective Date: April 9, 2025

Welcome to DailyFuel (https://dailyfuel.app). By using our website, you agree to the following Terms of Service.

1. Description of Service
DailyFuel is a free platform that helps users build habits and stay accountable through challenges.

2. Ownership and License
DailyFuel is a free service that allows users to create and join challenges with reasonable usage limits.
You may not resell, sublicense, or commercially redistribute access to the platform or its features.
All platform content, design, and code remain the property of DailyFuel.

3. User Data
We collect your name and email address to provide our service. We also use web cookies to improve your experience.
For more details, please read our Privacy Policy: https://dailyfuel.app/privacy-policy

4. Usage Limits
Free accounts have the following reasonable limitations:
- Up to 50 challenges can be created
- Up to 50 participants per challenge
Please contact support if you need to exceed these limits.

5. Governing Law
These terms are governed by the laws of Brazil.

6. Updates to the Terms
We may update these Terms from time to time. Users will be notified of any changes by email.

7. Contact
For any questions, contact us at thiago@dailyfuel.app.`}
        </pre>
      </div>
    </main>
  );
};

export default TOS;

/* Paid version

 {`Effective Date: April 9, 2025

Welcome to DailyFuel (https://dailyfuel.app). By using our website, you agree to the following Terms of Service.

1. Description of Service
DailyFuel provides a JavaScript code boilerplate to help entrepreneurs launch their startups faster.

2. Ownership and License
DailyFuel is a subscription-based service that allows users to join challenges for free and, with a paid subscription, create and invite others to challenges.
You may not resell, sublicense, or commercially redistribute access to the platform or its features.
All platform content, design, and code remain the property of DailyFuel.

3. Refund Policy
You may request a full refund within 7 days of your purchase. Please contact us at thiago@dailyfuel.app.

4. User Data
We collect your name, email address, and payment information to process orders. We also use web cookies to improve your experience.
For more details, please read our Privacy Policy: https://dailyfuel.app/privacy-policy

5. Governing Law
These terms are governed by the laws of Brazil.

6. Updates to the Terms
We may update these Terms from time to time. Users will be notified of any changes by email.

7. Contact

*/