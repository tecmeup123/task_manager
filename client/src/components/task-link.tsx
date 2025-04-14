import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

interface TaskLinkProps {
  taskId: number;
  editionId: number;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onClick?: () => void;
}

/**
 * A specialized component for task links that will navigate to the task
 * and pass state to ensure the task modal opens
 */
export default function TaskLink({
  taskId,
  editionId,
  children,
  variant = 'outline',
  size = 'sm',
  className = '',
  onClick
}: TaskLinkProps) {
  const [, navigate] = useLocation();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Call the optional onClick handler
    if (onClick) onClick();
    
    // Navigate to the tasks page with the right state and URL params
    const url = `/tasks?editionId=${editionId}&taskId=${taskId}`;
    navigate(url, { state: { openTaskModal: true, taskId, fromNotification: true } });
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}