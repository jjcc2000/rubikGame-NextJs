"use client";

import { handleSignIn, handleSignOut } from "../lib/auth";
import { useSession } from "next-auth/react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/cube");
      console.log("there is a session");
    }
  }, [session, router]);


  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div>
          <h1 className="text-3xl font-bold">Rubik's Cube Solver</h1>
          {session ? (
            <div>
              <h2 className="text-lg text-center font-medium text-gray-700">
                Welcome
              </h2>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 mt-4 text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-screen gap-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleSignIn}
                  className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Sign in with Google
                </button>
                <button
                  onClick={() => router.push("/cube?guest=true")}
                  className="px-6 py-3 text-white bg-orange-600 rounded-lg hover:bg-orange-700"
                >
                  Continue as Guest
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
