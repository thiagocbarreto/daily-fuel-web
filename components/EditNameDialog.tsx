"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createClient } from "@/libs/supabase/client";
import { toast } from "react-hot-toast";

interface EditNameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentName?: string;
  onNameUpdated: (newName: string) => void;
}

export function EditNameDialog({ isOpen, onClose, currentName = "", onNameUpdated }: EditNameDialogProps) {
  const [name, setName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  // Update name state when currentName changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      setName(currentName);
    }
  }, [currentName, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No user found");

      // Update the user's metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { name: name.trim() }
      });

      if (metadataError) throw metadataError;

      // Update the users table
      const { error: dbError } = await supabase
        .from('users')
        .update({ name: name.trim() })
        .eq('id', user.id);

      if (dbError) throw dbError;

      onNameUpdated(name.trim());
      toast.success("Name updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating name:", error);
      toast.error("Failed to update name. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Name</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
          <DialogFooter>
            <button 
              type="button" 
              className="btn btn-ghost" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                "Save"
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 