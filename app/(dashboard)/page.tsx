import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CreditCard,
  Database,
  FileText,
  MessageSquare,
  Inbox,
  UserPlus,
  Layers,
} from "lucide-react";
// import { Terminal } from "./terminal";
import { CircleIcon } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
                Reverse Job Platform
                <span className="block text-orange-500">
                  The AI-Powered Recruitment Platform
                </span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Transforming the traditional recruitment process by connecting
                top talent with the right opportunities through AI-driven
                matching and micro-interviews – all within 7 days.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                {/* <a
                  href="https://vercel.com/templates/next.js/next-js-saas-starter"
                  target="_blank"
                > */}
                {/* <Button
                    size="lg"
                    variant="outline"
                    className="text-lg rounded-full"
                  >
                    Deploy your own
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button> */}
                {/* </a> */}
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              {/* <Terminal /> */}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <CircleIcon className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  AI-powered matching
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Automatically matches qualified candidates to appropriate
                  positions
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Database className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Streamlining the recruitment process
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Streamlines the recruitment process with AI-powered matching
                  and micro-interviews.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Ensuring quality matches
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Ensures quality matches through algorithmic precision.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-orange-500 sm:text-4xl">
            Recruiter Journey
          </h2>
          <p className="mt-3 max-w-3xl text-lg text-gray-500">
            Define your role, let our algorithm find the best candidates, and
            add mini interview questions to qualify candidates before live
            interviews.
          </p>

          <div className="mt-10 grid gap-8 sm:grid-cols-1 lg:grid-cols-2">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-orange-500 flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Job Description Creation
              </h3>
              <p className="mt-2 text-gray-600">
                Create standardized job posts visible to candidates:
              </p>
              <ul className="mt-3 list-disc list-inside space-y-1 text-gray-700">
                <li>Job Description</li>
                <li>Job Requirements</li>
                <li>Responsibilities and required skills</li>
                <li>Company information and culture</li>
              </ul>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-orange-500 flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Mini Interview Questions
              </h3>
              <p className="mt-2 text-gray-600">
                Add 2–3 short-answer prompts to pre-qualify:
              </p>
              <ul className="mt-3 list-disc list-inside space-y-1 text-gray-700">
                <li>Assess role-specific experience and impact</li>
                <li>Understand motivation and problem-solving</li>
                <li>Evaluate cultural and technical fit</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-orange-500 sm:text-4xl">
            Candidate Journey
          </h2>
          <p className="mt-3 max-w-3xl text-lg text-gray-500">
            Build your profile, tailor it for different roles, receive
            AI-matched offers, and complete micro-interviews to express
            interest.
          </p>

          <div className="mt-10 grid gap-8 sm:grid-cols-1 lg:grid-cols-2">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-orange-500 flex items-center">
                <UserPlus className="mr-2 h-5 w-5" /> Profile Creation
              </h3>
              <p className="mt-2 text-gray-600">
                Start fast with AI-assisted parsing:
              </p>
              <ul className="mt-3 list-disc list-inside space-y-1 text-gray-700">
                <li>Upload an existing resume</li>
                <li>AI parses and pre-fills structured profile data</li>
              </ul>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-orange-500 flex items-center">
                <Layers className="mr-2 h-5 w-5" />
                Multiple Profiles & Preferences
              </h3>
              <p className="mt-2 text-gray-600">
                Target different roles and industries:
              </p>
              <ul className="mt-3 list-disc list-inside space-y-1 text-gray-700">
                <li>Create and manage multiple tailored profiles</li>
                <li>Set custom job preferences per profile</li>
              </ul>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-orange-500 flex items-center">
                <Inbox className="mr-2 h-5 w-5" />
                Matched Offers
              </h3>
              <p className="mt-2 text-gray-600">
                Get timely invites that fit you:
              </p>
              <ul className="mt-3 list-disc list-inside space-y-1 text-gray-700">
                <li>Receive AI-matched job invites directly to your inbox</li>
                <li>Offers are valid for 7 days before expiring</li>
              </ul>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-orange-500 flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Micro-Interview
              </h3>
              <p className="mt-2 text-gray-600">
                Express interest and qualify quickly:
              </p>
              <ul className="mt-3 list-disc list-inside space-y-1 text-gray-700">
                <li>Answer short recruiter questions if interested</li>
                <li>Profile and answers submitted automatically</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Ready to find your next job?
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                Our platform provides everything you need to get your job search
                up and running quickly.
              </p>
            </div>
            <div className="mt-8 lg:mt-0 flex justify-center lg:justify-end">
              <Button
                size="lg"
                className="text-lg rounded-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Link href="/sign-up">Sign up</Link>
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t bg-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-gray-900 font-semibold">
                Reverse Job Platform
              </p>
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/sign-in"
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
