import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

// Available emojis for reactions
const AVAILABLE_EMOJIS = ["👍", "👎", "❤️", "🎉", "👀", "🔥", "🚀", "⚡", "✅", "⏰"];

type EmojiReaction = {
  id: number;
  userId: number;
  emoji: string;
  createdAt: string;
};

type TaskReaction = EmojiReaction & {
  taskId: number;
};

type CommentReaction = EmojiReaction & {
  commentId: number;
};

type EmojiReactionsProps = {
  entityType: "task" | "comment";
  entityId: number;
  className?: string;
};

export function EmojiReactions({ entityType, entityId, className }: EmojiReactionsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Query key and endpoint based on entity type
  const queryKey = entityType === "task" 
    ? ["/api/tasks", entityId, "reactions"] 
    : ["/api/comments", entityId, "reactions"];
    
  const endpoint = entityType === "task"
    ? `/api/tasks/${entityId}/reactions`
    : `/api/comments/${entityId}/reactions`;

  // Fetch existing reactions
  const { data: reactions = [], isLoading } = useQuery<EmojiReaction[]>({
    queryKey,
    enabled: !!entityId,
  });

  // Group reactions by emoji
  const reactionsByEmoji = reactions.reduce((acc, reaction) => {
    acc[reaction.emoji] = acc[reaction.emoji] || [];
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, EmojiReaction[]>);

  // User's reactions - to highlight which ones the user has already reacted with
  const userReactions = reactions.filter(r => r.userId === user?.id);
  const userReactionEmojis = new Set(userReactions.map(r => r.emoji));

  // Add or remove reaction
  const toggleReactionMutation = useMutation({
    mutationFn: async (emoji: string) => {
      const response = await apiRequest("POST", endpoint, { emoji });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch data
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle emoji click
  const handleEmojiClick = (emoji: string) => {
    if (!user) {
      toast({
        title: t("error"),
        description: t("auth.loginRequired"),
        variant: "destructive",
      });
      return;
    }
    
    toggleReactionMutation.mutate(emoji);
    setIsOpen(false);
  };

  return (
    <div className={cn("flex flex-wrap gap-1 items-center", className)}>
      {/* Display existing reaction counts */}
      {Object.entries(reactionsByEmoji).map(([emoji, reactions]) => (
        <Button
          key={emoji}
          variant={userReactionEmojis.has(emoji) ? "default" : "outline"}
          size="sm"
          className="h-8 px-2 rounded-full"
          onClick={() => handleEmojiClick(emoji)}
        >
          <span className="mr-1">{emoji}</span>
          <span>{reactions.length}</span>
        </Button>
      ))}

      {/* Emoji picker */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 rounded-full"
            aria-label={t("addReaction")}
          >
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex flex-wrap gap-2 max-w-[220px]">
            {AVAILABLE_EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}