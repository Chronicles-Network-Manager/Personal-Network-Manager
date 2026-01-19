"use client";

import React from "react";
import { Contact } from "@/types/contact";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Users,
  ExternalLink,
  Linkedin,
  Github,
  Instagram,
  MessageCircle,
  X,
} from "lucide-react";
import { Group } from "@/types/Enums/Group";
import { cn } from "@/lib/utils";

interface ContactDetailsPanelProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContactDetailsPanel: React.FC<ContactDetailsPanelProps> = ({
  contact,
  open,
  onOpenChange,
}) => {
  if (!contact || !open) return null;

  const fullName = `${contact.firstName}${contact.middleName ? ` ${contact.middleName}` : ""} ${contact.lastName}`.trim();
  const groupNames: Record<Group, string> = {
    [Group.USER]: "User",
    [Group.FAMILY]: "Family",
    [Group.FRIENDS]: "Friends",
    [Group.WORK]: "Work",
    [Group.ACQUAINTANCE]: "Acquaintance",
    [Group.SCHOOL]: "School",
    [Group.COLLEGE]: "College",
    [Group.OTHER]: "Other",
  };

  const hasSocialLinks = 
    contact.socialLinks?.linkedin ||
    contact.socialLinks?.instagram ||
    contact.socialLinks?.github ||
    contact.socialLinks?.discord ||
    contact.socialLinks?.reddit ||
    contact.socialLinks?.other;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      });
    } catch {
      return dateString;
    }
  };

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[9999] bg-black/50 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => onOpenChange(false)}
      />
      
      {/* Side Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-[10000] h-full w-full max-w-lg bg-background shadow-lg transition-transform duration-300 ease-in-out overflow-y-auto",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 backdrop-blur-sm p-6">
          <div>
            <h2 className="text-2xl font-semibold">{fullName}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {contact.jobTitle} {contact.company ? `at ${contact.company}` : ""}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Professional Section */}
          {(contact.jobTitle || contact.company || contact.work) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Professional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {contact.jobTitle && (
                  <div>
                    <span className="text-muted-foreground">Title:</span>{" "}
                    <span className="font-medium">{contact.jobTitle}</span>
                  </div>
                )}
                {contact.company && (
                  <div>
                    <span className="text-muted-foreground">Company:</span>{" "}
                    <span className="font-medium">{contact.company}</span>
                  </div>
                )}
                {contact.work && (
                  <div>
                    <span className="text-muted-foreground">Work:</span>{" "}
                    <span className="font-medium">{contact.work}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Contact Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  <span>{contact.email}</span>
                </a>
              )}
              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  <span>{contact.phone}</span>
                </a>
              )}
              {contact.otherEmails && contact.otherEmails.length > 0 && (
                <div className="space-y-1">
                  {contact.otherEmails.map((email, idx) => (
                    <a
                      key={idx}
                      href={`mailto:${email}`}
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      <span>{email}</span>
                    </a>
                  ))}
                </div>
              )}
              {contact.otherPhones && contact.otherPhones.length > 0 && (
                <div className="space-y-1">
                  {contact.otherPhones.map((phone, idx) => (
                    <a
                      key={idx}
                      href={`tel:${phone}`}
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Phone className="h-4 w-4" />
                      <span>{phone}</span>
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location Section */}
          {contact.location && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {contact.location.address && (
                  <div>{contact.location.address}</div>
                )}
                <div className="text-muted-foreground">
                  {[contact.location.city, contact.location.country]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Groups Section */}
          {contact.groups && contact.groups.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Groups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {contact.groups.map((group, idx) => (
                    <Badge key={idx} variant="secondary">
                      {groupNames[group]}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Social Links Section */}
          {hasSocialLinks && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Social Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {contact.socialLinks?.linkedin && (
                  <a
                    href={contact.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Linkedin className="h-4 w-4" />
                    <span>LinkedIn</span>
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </a>
                )}
                {contact.socialLinks?.instagram && (
                  <a
                    href={contact.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Instagram className="h-4 w-4" />
                    <span>Instagram</span>
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </a>
                )}
                {contact.socialLinks?.github && (
                  <a
                    href={contact.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Github className="h-4 w-4" />
                    <span>GitHub</span>
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </a>
                )}
                {contact.socialLinks?.discord && (
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="h-4 w-4" />
                    <span>Discord: {contact.socialLinks.discord}</span>
                  </div>
                )}
                {contact.socialLinks?.reddit && (
                  <a
                    href={contact.socialLinks.reddit}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Reddit</span>
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </a>
                )}
                {contact.socialLinks?.other && (
                  <a
                    href={contact.socialLinks.other}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Other</span>
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Personal Section */}
          {(contact.birthday || (contact.interests && contact.interests.length > 0)) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {contact.birthday && (
                  <div>
                    <span className="text-muted-foreground">Birthday:</span>{" "}
                    <span className="font-medium">{formatDate(contact.birthday)}</span>
                  </div>
                )}
                {contact.interests && contact.interests.length > 0 && (
                  <div>
                    <div className="text-muted-foreground mb-2">Interests:</div>
                    <div className="flex flex-wrap gap-2">
                      {contact.interests.map((interest, idx) => (
                        <Badge key={idx} variant="outline">
                          {typeof interest === 'object' && 'key' in interest 
                            ? interest.key 
                            : String(interest)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes Section */}
          {contact.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {contact.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};