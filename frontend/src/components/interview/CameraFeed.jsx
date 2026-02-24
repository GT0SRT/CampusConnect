import React, { useRef, useEffect, useState } from 'react';
import { VideoOff } from 'lucide-react';

const CameraFeed = ({ isEnabled = true, videoDeviceId = '' }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const activeStreamRef = useRef(null);

  // Request permissions and get stream only when camera is enabled
  useEffect(() => {
    let isMounted = true;

    const stopStream = () => {
      const activeStream = activeStreamRef.current;
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
        activeStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (isMounted) {
        setStream(null);
      }
    };

    if (!isEnabled) {
      stopStream();
      return () => {
        isMounted = false;
      };
    }

    const getCameraStream = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (isMounted) {
          setError("getUserMedia is not supported by this browser");
        }
        return;
      }

      try {
        setError(null);
        stopStream();
        const constraints = {
          video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true,
          audio: false,
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (isMounted) {
          activeStreamRef.current = mediaStream;
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.play();
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error accessing camera:", err);
          setError(err.name || "Permission denied or no camera available");
        }
      }
    };

    getCameraStream();

    return () => {
      isMounted = false;
      stopStream();
    };
  }, [videoDeviceId, isEnabled]);

  // Toggle camera on/off without restarting stream
  useEffect(() => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = isEnabled;
      });
    }
    // Ensure video is playing when enabled
    if (isEnabled && videoRef.current) {
      videoRef.current.play().catch(err => console.log("Play error:", err));
    }
  }, [isEnabled, stream]);

  if (error) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ color: '#ef4444', fontSize: '14px', fontWeight: '500', textAlign: 'center', padding: '0 16px' }}>
          {error}
        </div>
        <div style={{ color: '#9ca3af', fontSize: '12px', textAlign: 'center', padding: '0 16px' }}>
          Please grant camera permissions or use a supported browser
        </div>
      </div>
    );
  }

  // Always render video, show overlay when camera is off
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#000' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          backgroundColor: '#000',
          opacity: isEnabled ? 1 : 0,
        }}
      />
      {/* Camera off overlay */}
      {!isEnabled && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <VideoOff style={{ width: '48px', height: '48px', color: '#9ca3af' }} />
          <div style={{ color: '#9ca3af', fontSize: '14px', fontWeight: '500' }}>
            Camera Off
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraFeed;