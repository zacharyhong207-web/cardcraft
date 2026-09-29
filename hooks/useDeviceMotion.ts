import { useState, useEffect, useCallback } from 'react';
import { useMotionValue, MotionValue } from 'framer-motion';

export function useDeviceMotion(): {
  xPct: MotionValue<number>;
  yPct: MotionValue<number>;
  requestPermission: () => Promise<void>;
} {
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  
  const xPct = useMotionValue(0);
  const yPct = useMotionValue(0);

  const requestPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && typeof (window as any).DeviceOrientationEvent !== 'undefined' && typeof ((window as any).DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await ((window as any).DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          setPermissionGranted(true);
        } else {
          setPermissionGranted(false);
        }
      } catch (error) {
        console.error('Error requesting device orientation permission:', error);
      }
    } else {
      setPermissionGranted(true);
    }
  }, []);

  useEffect(() => {
    if (permissionGranted === false) return;

    let baseBeta: number | null = null;
    let animationFrameId: number;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      let { beta, gamma } = event;
      if (beta === null || gamma === null) return;

      if (baseBeta === null) {
        baseBeta = beta;
      }

      let deltaBeta = beta - baseBeta;
      let deltaGamma = gamma; 

      const maxTilt = 45; 
      let newY = deltaBeta / maxTilt;
      let newX = deltaGamma / maxTilt;

      newX = Math.max(-0.5, Math.min(0.5, newX));
      newY = Math.max(-0.5, Math.min(0.5, newY));

      animationFrameId = requestAnimationFrame(() => {
        xPct.set(newX);
        yPct.set(newY);
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [permissionGranted, xPct, yPct]);

  return { xPct, yPct, requestPermission };
}
