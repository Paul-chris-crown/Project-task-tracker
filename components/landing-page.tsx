'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">Task Tracker</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A powerful project management app that helps teams track progress, manage tasks, and achieve their goals with effective collaboration.
          </p>
          <div className="mt-8 space-x-4">
            <Button asChild size="lg">
              <Link href="/login">
                Get Started
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <circle cx="12" cy="12" r="2"></circle>
              </svg>
              <h3 className="text-2xl font-semibold leading-none tracking-tight">Project Management</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Create, organize, and track projects with ease. Set deadlines, assign tasks, and monitor progress effectively.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-green-600 dark:text-green-400 mb-4">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <h3 className="text-2xl font-semibold leading-none tracking-tight">Task Tracking</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Break down projects into manageable tasks. Track status, assign responsibilities, and ensure nothing falls through the cracks.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-4">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                <polyline points="16 7 22 7 22 13"></polyline>
              </svg>
              <h3 className="text-2xl font-semibold leading-none tracking-tight">Progress Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Visualize project progress with intuitive charts and metrics. Get insights into team performance and project health.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm max-w-2xl mx-auto">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="font-semibold tracking-tight text-2xl">Ready to boost your productivity?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Join thousands of teams who trust Task Tracker to manage their projects effectively.
              </p>
            </div>
            <div className="p-6 pt-0">
              <Button asChild size="lg">
                <Link href="/login">
                  Start Free Today
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
