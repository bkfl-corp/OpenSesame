"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <DashboardSkeleton />;
  }

  if (status === "authenticated" && session?.user) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
        </div>

        <section className="bg-card p-6 rounded-lg shadow-sm border mb-8">
          <p className="text-lg mb-4">
            Welcome to your dashboard, {session.user.name}!
          </p>
          <p className="text-muted-foreground">
            Monitor your home security with your smart doorbell system.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 text-center flex justify-center items-center h-screen">
      An unexpected error occurred. Please try signing in again.
      <Button onClick={() => signOut({ callbackUrl: "/" })} className="ml-4">
        Sign Out
      </Button>
    </div>
  );
}
