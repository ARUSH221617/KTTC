"use client";

import { Info } from "lucide-react";
import { Button } from "@/components/agent/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ChatInfoButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="order-3 hidden bg-zinc-900 px-2 text-zinc-50 hover:bg-zinc-800 md:ml-auto md:flex md:h-fit dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Info size={16} />
          Info
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI Agent Capabilities</DialogTitle>
          <DialogDescription>
            Guidelines and information about the tools available to this AI agent.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-medium">Content Management</h3>
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                <li>Create, update, and read blog posts (including featured image generation).</li>
                <li>Create and read testimonials (including avatar generation).</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-medium">Course Management</h3>
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                <li>Create, update, and list courses (supports AI thumbnail generation).</li>
                <li>Issue certificates to users upon course completion.</li>
                <li>Read certificate details.</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-medium">User Management</h3>
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                <li>Create new users (User, Instructor, Admin).</li>
                <li>Update existing user details.</li>
                <li>List users with filtering capabilities.</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-medium">System Administration</h3>
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                <li>Read and update global application settings.</li>
                <li>View contact form submissions.</li>
              </ul>
            </div>

            <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
              <p>
                <strong>Note:</strong> Most of these actions require Admin privileges.
                The agent will check your role before executing sensitive operations.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
