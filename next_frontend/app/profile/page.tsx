"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  getUserFamily,
  userHasFamily,
  getFamilyJoinCode,
  getFamilyMembers,
} from "@/lib/actions/familyActions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Copy, Users, Crown } from "lucide-react";
import Link from "next/link";
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton";

interface FamilyMember {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: Date;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [familyData, setFamilyData] = useState<{
    id: string;
    name: string;
    joinCode?: string;
  } | null>(null);
  const [familyMembers, setFamilyMembers] = useState<{
    members: FamilyMember[];
    creatorId: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchFamilyData() {
      if (status === "authenticated") {
        const hasFamily = await userHasFamily();

        if (hasFamily) {
          const familyInfo = await getUserFamily();

          if (familyInfo) {
            // Get the join code using server action
            const joinCode = await getFamilyJoinCode();
            setFamilyData({ ...familyInfo, joinCode: joinCode || undefined });

            // Get family members
            const members = await getFamilyMembers();
            setFamilyMembers(members);
          }
        }
      }
      setLoading(false);
    }

    fetchFamilyData();
  }, [status]);

  const copyJoinCode = () => {
    if (familyData?.joinCode) {
      navigator.clipboard
        .writeText(familyData.joinCode)
        .then(() => {
          toast({ description: "Join code copied to clipboard!" });
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
          toast({
            description: "Failed to copy code.",
            variant: "destructive",
          });
        });
    }
  };

  if (status === "loading" || loading) {
    return <ProfileSkeleton />;
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-6">
        <p>Please sign in to view your profile.</p>
        <Button asChild className="mt-4">
          <Link href="/">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-6">Profile</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={session.user.image ?? "/placeholder.svg"}
                  alt={session.user.name ?? "User"}
                />
                <AvatarFallback>
                  {session.user.name?.charAt(0).toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">{session.user.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {session.user.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Family Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Family Information</CardTitle>
            <CardDescription>Your family details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {familyData ? (
              <>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">
                    {familyData.name} Family
                  </h3>
                  {familyData.joinCode && (
                    <div className="ml-auto flex items-center gap-1">
                      <span className="text-xs text-muted-foreground mr-1">
                        Join Code:
                      </span>
                      <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                        {familyData.joinCode}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={copyJoinCode}
                        aria-label="Copy join code"
                        className="h-6 w-6"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <hr className="my-2" />

                {/* Family Members Section */}
                {familyMembers && familyMembers.members.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">Family Members</h4>
                      {familyMembers.creatorId && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Crown className="h-3 w-3 text-amber-500" /> Family
                          creator
                        </p>
                      )}
                    </div>
                    <ul className="space-y-2">
                      {familyMembers.members.map((member) => (
                        <li
                          key={member.id}
                          className="flex items-center gap-2 py-1"
                        >
                          <Avatar className="h-7 w-7">
                            <AvatarImage
                              src={member.image ?? "/placeholder.svg"}
                              alt={member.name ?? "User"}
                            />
                            <AvatarFallback>
                              {member.name?.charAt(0).toUpperCase() ?? "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <p className="text-sm font-medium">
                                {member.name}
                              </p>
                              {familyMembers.creatorId === member.id && (
                                <Crown className="h-3 w-3 ml-1 text-amber-500" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {member.email}
                            </p>
                          </div>
                          {member.id === session.user.id && (
                            <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                              You
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="mb-4">You are not currently in a family.</p>
                <Button asChild>
                  <Link href="/setup">Create or Join a Family</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
