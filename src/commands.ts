import { EventEmitter } from 'events';
import VoxeetSDK from '@voxeet/voxeet-web-sdk';
import { Participant } from '@voxeet/voxeet-web-sdk/types/models/Participant';

import { TargetedCommand, CommandsType } from './types/Commands';

class Commands extends EventEmitter implements CommandsType {
    constructor() {
        super();

        VoxeetSDK.command.on('received', this.onCommandReceive);
    }

    private onCommandReceive = (participant: Participant, message: string) => {
        const payload = JSON.parse(message) as TargetedCommand;
        if (!payload.target || (payload.target.length > 0 && !payload.target.includes(VoxeetSDK.session.participant.id))) {
            // Ignore this command
            return;
        }

        // Emit this event for the extension
        this.emit('received', participant, payload.message);
    };

    public send = async (message: string, participants: Participant[]): Promise<void> => {
        const payload: TargetedCommand = {
            target: participants.map((p) => p.id),
            message: message,
        };

        await VoxeetSDK.command.send(JSON.stringify(payload));
    };
}

export default Commands;
