import React from 'react';
import AgoraUIKit from 'agora-react-uikit';

const AgoraCall = ({ appId, channelName, token, onEndCall }) => {
  // Use provided appId or fallback to the one in the environment
  const rtcProps = {
    appId: appId || 'e7f6e9aeecf14b2ba10e3f40be9f56e7',
    channel: channelName || 'test_room',
    token: token || null, // null if no token is required
  };

  const styleProps = {
    container: { 
      borderRadius: '1.5rem', 
      overflow: 'hidden', 
      backgroundColor: '#111827',
      width: '100%',
      height: '100%'
    },
    localBtnContainer: { 
      backgroundColor: 'rgba(31, 41, 55, 0.8)', 
      borderRadius: '1rem',
      bottom: '20px'
    },
    localBtnStyles: { 
      muteMic: { borderRadius: '0.75rem', backgroundColor: '#374151' }, 
      muteVideo: { borderRadius: '0.75rem', backgroundColor: '#374151' },
      endCall: { borderRadius: '0.75rem', backgroundColor: '#ef4444' }
    },
    theme: '#00796B'
  };

  const callbacks = {
    EndCall: () => {
      if (onEndCall) onEndCall();
    },
  };

  return (
    <div className="w-full h-full relative overflow-hidden rounded-[2.5rem] bg-gray-900 shadow-inner">
      <AgoraUIKit rtcProps={rtcProps} callbacks={callbacks} styleProps={styleProps} />
    </div>
  );
};

export default AgoraCall;
