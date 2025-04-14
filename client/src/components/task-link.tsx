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
    
    // Simply navigate to the task details page with the editionId as a query parameter
    const url = `/tasks/${taskId}?editionId=${editionId}`;
    
    // Use standard navigation approach
    navigate(url);
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