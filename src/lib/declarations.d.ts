// This file is used to provide TypeScript with type definitions for
// JavaScript libraries that do not have their own @types package.

// Declaration for 'react-media-recorder'
declare module 'react-media-recorder' {
  import type { ReactElement } from 'react';

  export type StatusMessages =
    | 'media_aborted'
    | 'permission_denied'
    | 'no_specified_media_found'
    | 'media_in_use'
    | 'invalid_media_constraints'
    | 'no_constraints'
    | 'recorder_error'
    | 'idle'
    | 'acquiring_media'
    | 'delayed_start'
    | 'recording'
    | 'stopping'
    | 'stopped'
    | 'paused';

  export interface UseReactMediaRecorderOptions {
    audio?: boolean;
    video?: boolean;
    screen?: boolean;
    onStop?: (blobUrl: string, blob: Blob) => void;
    blobPropertyBag?: BlobPropertyBag;
    mediaRecorderOptions?: MediaRecorderOptions;
    askPermissionOnMount?: boolean;
  }

  export interface ReactMediaRecorderRenderProps {
    error: string;
    muteAudio: () => void;
    unMuteAudio: () => void;
    startRecording: () => void;
    pauseRecording: () => void;
    resumeRecording: () => void;
    stopRecording: () => void;
    mediaBlobUrl: null | string;
    status: StatusMessages;
    isAudioMuted: boolean;
    previewStream: MediaStream | null;
    clearBlobUrl: () => void;
  }

  export function useReactMediaRecorder(
    options: UseReactMediaRecorderOptions
  ): ReactMediaRecorderRenderProps;

  export interface ReactMediaRecorderProps extends UseReactMediaRecorderOptions {
    render: (props: ReactMediaRecorderRenderProps) => ReactElement;
  }

  export const ReactMediaRecorder: (props: ReactMediaRecorderProps) => ReactElement;
}
