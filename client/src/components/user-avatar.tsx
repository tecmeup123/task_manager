import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserProfile } from "@/components/user-profile";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import { Settings, User, LogOut } from "lucide-react";

export function UserAvatar() {
  const { user, logoutMutation } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  
  if (!user) return null;
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.username} />
              ) : (
                <AvatarFallback className="bg-primary">
                  {getInitials(user.fullName || user.username)}
                </AvatarFallback>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.fullName || user.username}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email || user.username}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setProfileOpen(true)}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.location.href = "/settings"}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{logoutMutation.isPending ? "Logging out..." : "Log out"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <UserProfile isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}