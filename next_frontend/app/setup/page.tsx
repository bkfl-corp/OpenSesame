"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFamily, joinFamily } from "@/lib/actions/familyActions";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SetupSkeleton } from "@/components/skeletons/setup-skeleton";

export default function SetupPage() {
  const router = useRouter();
  const { status } = useSession();
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  const [familyName, setFamilyName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "loading") {
    return <SetupSkeleton />;
  }

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await createFamily(familyName);

      if (result.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await joinFamily(joinCode);

      if (result.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md py-12">
      <div className="bg-card rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Welcome to OpenSesame
        </h1>
        <p className="text-muted-foreground mb-6 text-center">
          To get started, create or join a family.
        </p>

        <div className="flex border-b border-border mb-6">
          <button
            className={`flex-1 py-2 text-center ${
              activeTab === "create"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("create")}
          >
            Create Family
          </button>
          <button
            className={`flex-1 py-2 text-center ${
              activeTab === "join"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("join")}
          >
            Join Family
          </button>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {activeTab === "create" ? (
          <form onSubmit={handleCreateFamily}>
            <div className="mb-4">
              <label htmlFor="familyName" className="block font-medium mb-2">
                Family Name
              </label>
              <Input
                type="text"
                id="familyName"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Family"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleJoinFamily}>
            <div className="mb-4">
              <label htmlFor="joinCode" className="block font-medium mb-2">
                Family Join Code
              </label>
              <Input
                type="text"
                id="joinCode"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Enter 6-digit code"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Joining..." : "Join Family"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
