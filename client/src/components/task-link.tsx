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
    
    // Navigate to the tasks page with the right URL params
    // We'll add taskId to URL params for direct access and also pass via state
    const url = `/tasks?editionId=${editionId}&taskId=${taskId}`;
    
    // WORKAROUND: Use direct history manipulation to force the state to be set
    // This is more reliable than using the navigate function's state parameter
    window.history.pushState(
      { 
        state: { 
          openTaskModal: true, 
          taskId: taskId, 
          fromNotification: true 
        } 
      }, 
      '', 
      url
    );
    
    // Also use navigate to trigger the route change
    navigate(url, { 
      replace: true,
    });
    
    // Force window reload to ensure the task modal opens
    // This is necessary because the state might not be properly set otherwise
    window.location.href = url;
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