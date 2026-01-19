"use client";

import React from "react";
import { Contact } from "@/types/contact";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PinPopupCardProps {
  contact: Contact;
  onShowMore: () => void;
  onClose: () => void;
}

export const PinPopupCard: React.FC<PinPopupCardProps> = ({
  contact,
  onShowMore,
  onClose,
}) => {
  const fullName = `${contact.firstName}${contact.middleName ? ` ${contact.middleName}` : ""} ${contact.lastName}`.trim();

  return (
    <div className="min-w-[260px] max-w-[280px] rounded-lg border bg-card p-4 shadow-sm relative z-[10003]">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base leading-tight truncate">
            {fullName}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {contact.jobTitle} {contact.company ? `at ${contact.company}` : ""}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Close popup"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <Button
        onClick={onShowMore}
        variant="outline"
        size="sm"
        className="w-full"
      >
        Show More
      </Button>
    </div>
  );
};