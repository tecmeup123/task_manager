import { useState, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Create a schema for form validation
const profileFormSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function UserProfile({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Create form with default values from the user object
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      avatarUrl: user?.avatarUrl || "",
    },
  });

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const res = await apiRequest("PATCH", "/api/user/profile", values);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], (oldData: any) => {
        return { ...oldData, ...data };
      });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for uploading avatar
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("avatar", file);
      
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error uploading avatar");
      }
      
      return await res.json();
    },
    onSuccess: (data) => {
      // Update the avatar URL in the form
      form.setValue("avatarUrl", data.avatarUrl);
      
      // Update the user data in the cache
      queryClient.setQueryData(["/api/user"], (oldData: any) => {
        return { ...oldData, avatarUrl: data.avatarUrl };
      });
      
      toast({
        title: "Avatar uploaded",
        description: "Your profile photo has been updated successfully.",
      });
      
      // Clear the file selection and preview
      setSelectedFile(null);
      setImagePreview(null);
      setIsUploading(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error uploading photo",
        description: error.message,
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };

  // Handle file selection for avatar upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadSelectedFile = () => {
    if (selectedFile) {
      uploadAvatarMutation.mutate(selectedFile);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and upload a profile photo.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Photo Upload Section */}
          <div className="pt-4">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative group">
                <Avatar className="h-24 w-24 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {imagePreview ? (
                    <AvatarImage src={imagePreview} alt="Preview" />
                  ) : user.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} alt={user.username} />
                  ) : (
                    <AvatarFallback className="h-24 w-24 bg-primary">
                      {getInitials(user.fullName || user.username)}
                    </AvatarFallback>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
                    <span className="text-white text-sm">Change</span>
                  </div>
                </Avatar>
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
              />
              
              {selectedFile && (
                <div className="flex flex-col items-center">
                  <span className="text-sm text-muted-foreground mb-2">
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={uploadSelectedFile} 
                      disabled={isUploading}
                      size="sm"
                    >
                      {isUploading ? "Uploading..." : "Upload"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        setImagePreview(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              {!selectedFile && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload Photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPEG, PNG, GIF or WebP. Max 5MB.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-4">Profile Information</h3>
            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your full name as it will appear in the application.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email address" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your email address for notifications and account recovery.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}