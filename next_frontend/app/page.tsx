"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronDown,
  ChevronUp,
  LogOut,
  Mic,
  MicOff,
  Settings,
  User,
  UserCheck,
  UserPlus,
  UserX,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

// Define the visitor type
type Visitor = {
  id: string;
  timestamp: Date;
  name: string;
  recognized: boolean;
  profileImage: string;
  doorImage: string;
};

// Current user
const currentUser = {
  name: "Will Whitehead",
  family: "BKFL Corp.",
  profileImage: "/dummy/will_profile.png",
};

// Generate dummy data with recognized individuals: Will and Josh
const generateDummyData = (): Visitor[] => {
  const recognizedPeople = [
    {
      name: "Will",
      profileImg: "/dummy/will_profile.png",
      doorImg: "/dummy/will_door.png",
    },
    {
      name: "Josh",
      profileImg: "/dummy/josh_profile.png",
      doorImg: "/dummy/josh_door.png",
    },
  ];
  const visitors: Visitor[] = [];

  // Generate 20 random visitor entries
  for (let i = 0; i < 20; i++) {
    const recognized = Math.random() > 0.4; // 60% chance of being recognized
    let name = "Unknown Visitor";
    let profileImage = `/placeholder.svg?height=80&width=80&text=?`;
    let doorImage = "/dummy/intruder_door.png";

    if (recognized) {
      const person =
        recognizedPeople[Math.floor(Math.random() * recognizedPeople.length)];
      name = person.name;
      profileImage = person.profileImg;
      doorImage = person.doorImg;
    }

    // Random time within the last 7 days
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - Math.floor(Math.random() * 7));
    timestamp.setHours(Math.floor(Math.random() * 24));
    timestamp.setMinutes(Math.floor(Math.random() * 60));

    visitors.push({
      id: `visitor-${i}`,
      timestamp,
      name,
      recognized,
      profileImage,
      doorImage,
    });
  }

  // Sort by timestamp (newest first)
  return visitors.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export default function HomePage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [micMuted, setMicMuted] = useState(true);
  const [speakerMuted, setSpeakerMuted] = useState(false);
  const [isTwoWayComm, setIsTwoWayComm] = useState(false);
  const [currentDoorImage, setCurrentDoorImage] = useState(
    "/dummy/live_view.png"
  );

  // Dialog state
  const [isFamilyDialogOpen, setIsFamilyDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  useEffect(() => {
    const data = generateDummyData();
    setVisitors(data);
  }, []);

  // Filter visitors by recognition status
  const recognizedVisitors = visitors.filter((visitor) => visitor.recognized);
  const unrecognizedVisitors = visitors.filter(
    (visitor) => !visitor.recognized
  );

  const toggleMic = () => {
    setMicMuted(!micMuted);
  };

  const toggleSpeaker = () => {
    setSpeakerMuted(!speakerMuted);
  };

  const toggleTwoWayComm = (checked: boolean) => {
    setIsTwoWayComm(checked);
    if (checked) {
      setMicMuted(false); // Automatically unmute mic for two-way communication
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Dialogs for Family Members and Settings */}
      <Dialog open={isFamilyDialogOpen} onOpenChange={setIsFamilyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Family Members</DialogTitle>
            <DialogDescription>
              Manage recognized family members here
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Add or remove family members from recognition.
              </p>
              <ul className="list-disc list-inside mt-2">
                <li>Will Whitehead</li>
                <li>Joshua Lee</li>
              </ul>
            </div>
            <Button variant="outline" size="sm">
              <UserPlus className="h-3 w-3 mr-1" />
              Add Family Member
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsFamilyDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isSettingsDialogOpen}
        onOpenChange={setIsSettingsDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Configure OpenSesame preferences
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Enable Notifications</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span>Auto-Unlock Door</span>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <span>Night Vision Mode</span>
              <Switch />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSettingsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">OpenSesame v0.1.0</h1>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 cursor-pointer">
                <AvatarImage
                  src={currentUser.profileImage}
                  alt={currentUser.name}
                />
                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {currentUser.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {currentUser.family}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>

              {/* Open Family Members dialog */}
              <DropdownMenuItem onSelect={() => setIsFamilyDialogOpen(true)}>
                <Users className="mr-2 h-4 w-4" />
                <span>Family Members</span>
              </DropdownMenuItem>

              {/* Open Settings dialog */}
              <DropdownMenuItem onSelect={() => setIsSettingsDialogOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Section - Live Feed */}
        <div className="space-y-4">
          <Card className="overflow-hidden border rounded-lg">
            <div className="bg-black relative aspect-video">
              <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 animate-pulse z-10">
                <span className="inline-block w-2 h-2 rounded-full bg-white mr-1"></span>
                LIVE
              </div>
              <Image
                src={currentDoorImage || "/placeholder.svg"}
                alt="Doorbell Live Feed"
                className="w-full h-full object-cover"
                width={800}
                height={500}
                priority
              />
            </div>

            <CardContent className="p-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Communication Mode:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      One-way
                    </span>
                    <Switch
                      checked={isTwoWayComm}
                      onCheckedChange={toggleTwoWayComm}
                    />
                    <span className="text-sm text-muted-foreground">
                      Two-way
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={micMuted ? "outline" : "default"}
                    className="flex items-center justify-center gap-2"
                    onClick={toggleMic}
                    disabled={isTwoWayComm} // Disabled in two-way mode as mic is always on
                  >
                    {micMuted ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                    {micMuted ? "Unmute Mic" : "Mute Mic"}
                  </Button>

                  <Button
                    variant={speakerMuted ? "outline" : "default"}
                    className="flex items-center justify-center gap-2"
                    onClick={toggleSpeaker}
                  >
                    {speakerMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                    {speakerMuted ? "Unmute Speaker" : "Mute Speaker"}
                  </Button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="px-4 pb-4 pt-0">
              <div className="text-sm text-muted-foreground">
                {isTwoWayComm
                  ? "Two-way communication enabled. You can speak with your visitor."
                  : "One-way communication mode. Click unmute mic to speak to your visitor."}
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Right Section - Visitor List */}
        <div className="space-y-4">
          <Card className="border shadow-none p-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">Recent Visitors</CardTitle>
              <CardDescription>
                Monitor and manage visitors at your doorstep
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 pt-2">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All Visitors</TabsTrigger>
                  <TabsTrigger value="recognized">Recognized</TabsTrigger>
                  <TabsTrigger value="unrecognized">Unrecognized</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                  <VisitorList
                    visitors={visitors}
                    onViewLive={(doorImage) => setCurrentDoorImage(doorImage)}
                  />
                </TabsContent>

                <TabsContent value="recognized" className="mt-4">
                  <VisitorList
                    visitors={recognizedVisitors}
                    onViewLive={(doorImage) => setCurrentDoorImage(doorImage)}
                  />
                </TabsContent>

                <TabsContent value="unrecognized" className="mt-4">
                  <VisitorList
                    visitors={unrecognizedVisitors}
                    onViewLive={(doorImage) => setCurrentDoorImage(doorImage)}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function VisitorList({
  visitors,
  onViewLive,
}: {
  visitors: Visitor[];
  onViewLive: (doorImage: string) => void;
}) {
  if (visitors.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No visitors found
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[600px] rounded-md border">
      <div className="space-y-4 p-4">
        {visitors.map((visitor) => (
          <VisitorCard
            key={visitor.id}
            visitor={visitor}
            onViewLive={onViewLive}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

function VisitorCard({
  visitor,
}: {
  visitor: Visitor;
  onViewLive: (doorImage: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 border-2 border-background">
              <AvatarImage src={visitor.profileImage} alt={visitor.name} />
              <AvatarFallback>{visitor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{visitor.name}</CardTitle>
              <CardDescription>
                {formatDistanceToNow(visitor.timestamp, { addSuffix: true })}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={visitor.recognized ? "default" : "destructive"}
            className="flex items-center gap-1"
          >
            {visitor.recognized ? (
              <>
                <UserCheck className="h-3 w-3" />
                <span>Recognized</span>
              </>
            ) : (
              <>
                <UserX className="h-3 w-3" />
                <span>Unknown</span>
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div
          className="rounded-md bg-muted p-2 text-sm mb-2 flex items-center justify-between cursor-pointer"
          onClick={toggleExpanded}
        >
          <div>
            {visitor.recognized
              ? `${
                  visitor.name
                } was recognized at ${visitor.timestamp.toLocaleTimeString()}`
              : `Unrecognized visitor detected at ${visitor.timestamp.toLocaleTimeString()}`}
          </div>
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {expanded && (
          <div className="rounded-md overflow-hidden h-48 mt-2 transition-all duration-200 ease-in-out">
            <Image
              src={visitor.doorImage || "/placeholder.svg"}
              alt={`${visitor.name} at door`}
              className="object-cover w-full h-full"
              width={400}
              height={300}
            />
            <div className="flex justify-between items-center mt-2">
              {!visitor.recognized && (
                <Button variant="outline" size="sm" className="text-xs">
                  <UserPlus className="h-3 w-3 mr-1" />
                  Add to Recognized
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
