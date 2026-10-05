declare module 'react-player' {
  import { Component, Ref } from 'react';
  interface ReactPlayerProps {
    url?: string;
    playing?: boolean;
    volume?: number;
    muted?: boolean;
    playbackRate?: number;
    width?: string | number;
    height?: string | number;
    style?: React.CSSProperties;
    onProgress?: (state: { played: number; playedSeconds: number; loaded: number }) => void;
    onDuration?: (duration: number) => void;
    config?: Record<string, any>;
    ref?: Ref<any>;
  }
  export default class ReactPlayer extends Component<ReactPlayerProps> {
    seekTo(amount: number, type?: 'fraction' | 'seconds'): void;
  }
}
