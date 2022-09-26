import { EventEmitter } from 'events';
import { Participant } from '@voxeet/voxeet-web-sdk/types/models/Participant';

export type ActionCommand = {
    action: string;
    payload: string;
};

export type TargetedCommand = {
    target: string[];
    message: string;
};

export type CommandsType = EventEmitter & {
    /**
     * Sends a command to a specific list of participants.
     * If the list is empty, the command will be received by all the participants.
     *
     * **Important:** the command will be received by all the participants at all time,
     * but will be filtered by this extension and the message will not be propagated
     * if the current participant is not in the target list.
     */
    send: (message: string, participants: Participant[]) => Promise<void>;
};
