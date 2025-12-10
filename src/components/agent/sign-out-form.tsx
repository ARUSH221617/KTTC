"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export const SignOutForm = () => {
  return (
    <Button
      variant="ghost"
      className="w-full px-1 py-0.5 justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Sign out
    </Button>
  );
};
