/// <reference types="node" />
import { PlayerSubscription, StreamType } from '@discordjs/voice';
import { EventEmitter, Readable } from 'stream';
export interface VoicePresenceEvent {
    connectionError: (event: Error, streamName: string | undefined) => void;
    connectionSignalling: (streamName: string | undefined) => void;
    connectionStandby: (streamName: string | undefined) => void;
    connectionJoining: (streamName: string | undefined) => void;
    connectionReady: (streamName: string | undefined) => void;
    connectionDestroyed: (streamName: string | undefined) => void;
    playerError: (streamName: string | undefined) => void;
    playerIdle: (streamName: string | undefined) => void;
    playerBuffering: (streamName: string | undefined) => void;
    playerStreaming: (streamName: string | undefined) => void;
    playerPaused: (streamName: string | undefined) => void;
}
export interface VoicePresence extends EventEmitter {
    on: <U extends keyof VoicePresenceEvent>(event: U, listener: VoicePresenceEvent[U]) => this;
    off: <U extends keyof VoicePresenceEvent>(event: U, listener: VoicePresenceEvent[U]) => this;
    emit: <U extends keyof VoicePresenceEvent>(event: U, ...args: Parameters<VoicePresenceEvent[U]>) => boolean;
}
export declare class VoicePresence extends EventEmitter {
    private readonly guildId;
    private readonly subscription;
    private streamName?;
    private volume?;
    constructor(guildId: string, subscription: PlayerSubscription);
    rejoin(channelId?: string, selfDeaf?: boolean, selfMute?: boolean): void;
    disconnect(final?: boolean): void;
    isPlaying(): boolean;
    pause(): void;
    resume(): void;
    stopTransmitting(): void;
    startTransmitting(stream: string | Readable, streamName?: string, inputType?: StreamType, inlineVolume?: boolean): void;
    getVolume(): number | undefined;
    setVolume(db: number): void;
    private getResourceVolumeTransformer;
}
//# sourceMappingURL=voice.d.ts.map