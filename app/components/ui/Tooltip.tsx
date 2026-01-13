'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  variant?: 'glass' | 'clay';
}

export default function Tooltip({
  content,
  children,
  position = 'top',
  delay = 300,
  variant = 'glass',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0, transform: '' });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 8;

    let x = 0;
    let y = 0;
    let transformValue = '';

    switch (position) {
      case 'top':
        x = rect.left + rect.width / 2;
        y = rect.top - gap;
        transformValue = 'translate(-50%, -100%)';
        break;
      case 'bottom':
        x = rect.left + rect.width / 2;
        y = rect.bottom + gap;
        transformValue = 'translate(-50%, 0)';
        break;
      case 'left':
        x = rect.left - gap;
        y = rect.top + rect.height / 2;
        transformValue = 'translate(-100%, -50%)';
        break;
      case 'right':
        x = rect.right + gap;
        y = rect.top + rect.height / 2;
        transformValue = 'translate(0, -50%)';
        break;
    }

    setCoords({ x, y, transform: transformValue });
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      {typeof window !== 'undefined' &&
        isVisible &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[9999]"
            style={{
              left: `${coords.x}px`,
              top: `${coords.y}px`,
              transform: coords.transform || 'translate(-50%, -100%)',
            }}
          >
            <div
              className={` ${
                variant === 'glass'
                  ? 'border border-white/30 bg-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-md'
                  : 'bg-gradient-to-br from-[#e8edf2] to-[#dfe7ed] text-slate-700 shadow-[3px_3px_6px_#c5c5c5,_-1.5px_-1.5px_6px_#ffffff,_inset_-2px_-2px_1px_#8a8a8acc]'
              } rounded-lg px-3 py-1.5 ${variant === 'glass' ? 'text-white' : 'text-slate-700'} animate-in fade-in zoom-in-95 text-xs font-medium whitespace-nowrap duration-200`}
            >
              {content}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
