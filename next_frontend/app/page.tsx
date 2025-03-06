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
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronDown,
  ChevronUp,
  Mic,
  MicOff,
  UserCheck,
  UserPlus,
  UserX,
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
      <h1 className="text-3xl font-bold tracking-tight mb-6">
        OpenSesame v0.1.0
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Section - Live Feed */}
        <div className="space-y-4">
          <div className="bg-black rounded-lg overflow-hidden relative aspect-video">
            <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
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

          <div className="bg-card rounded-lg p-4 border">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Communication Mode:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">One-way</span>
                  <Switch
                    checked={isTwoWayComm}
                    onCheckedChange={toggleTwoWayComm}
                  />
                  <span className="text-sm text-muted-foreground">Two-way</span>
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

              <div className="text-sm text-muted-foreground">
                {isTwoWayComm
                  ? "Two-way communication enabled. You can speak with your visitor."
                  : "One-way communication mode. Click unmute mic to speak to your visitor."}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Visitor List */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Recent Visitors
            </h2>
            <p className="text-muted-foreground">
              Monitor and manage visitors at your doorstep
            </p>
          </div>

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
