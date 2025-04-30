"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AddDoorbellForm from "@/components/AddDoorbellForm"; // Import the form

// Placeholder component - needs integration into actual tab structure
export default function FamilyTabContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // TODO: Add logic here to determine if user has devices already
  // For now, we assume they do not have devices yet
  const needsToAddDevice = true;

  return (
    <div className="p-4">
      {needsToAddDevice ? (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>Add New Doorbell</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add a New Doorbell Device</DialogTitle>
              <DialogDescription>
                Enter the details of your doorbell device to begin monitoring.
              </DialogDescription>
            </DialogHeader>
            {/* Pass a callback to close the modal on successful submission */}
            <AddDoorbellForm />
            {/* 
              Consider passing a prop like `onDeviceAdded` to AddDoorbellForm 
              so it can call setIsModalOpen(false) after success.
              Example: <AddDoorbellForm onDeviceAdded={() => setIsModalOpen(false)} />
              This would require modifying AddDoorbellForm to accept and call this prop.
            */}
          </DialogContent>
        </Dialog>
      ) : (
        <div>
          {/* Placeholder for displaying existing device details */}
          <p>Device details will go here.</p>
        </div>
      )}
    </div>
  );
}
