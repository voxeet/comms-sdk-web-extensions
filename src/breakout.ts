import VoxeetSDK from '@voxeet/voxeet-web-sdk';
import { ParticipantJoinedNotification, ParticipantLeftNotification } from '@voxeet/voxeet-web-sdk/types/events/notification';
import { BaseSubscription, SubscribeParticipantJoined, SubscribeParticipantLeft, SubscriptionType } from '@voxeet/voxeet-web-sdk/types/models/Notifications';
import { Participant, ParticipantStatus } from '@voxeet/voxeet-web-sdk/types/models/Participant';
import { v4 as uuidv4 } from 'uuid';

import { CreateBreakout, BreakoutRoom, BreakoutRooms, BreakoutRoomCommandPayload } from './types/Breakout';
import { CommandsType, ActionCommand } from './types/Commands';

const createBreakout: CreateBreakout = (commands: CommandsType) => {
    const COMMAND_UPDATE_NAME = 'BREAKOUT_ROOMS_UPDATE';
    const COMMAND_IGNORE_NAME = 'BREAKOUT_ROOMS_IGNORE';

    let breakoutRooms: BreakoutRooms = new Map<string, BreakoutRoom>();

    const initialize = () => {
        // Subscribe to the received event
        commands.on('received', onCommandReceive);

        VoxeetSDK.notification.on('participantJoined', onParticipantJoined);
        VoxeetSDK.notification.on('participantLeft', onParticipantLeft);

        let notificationSubscriptions: Array<BaseSubscription>;

        VoxeetSDK.conference.on('joined', () => {
            notificationSubscriptions = [
                {
                    type: 'Participant.Joined' as SubscriptionType,
                    conferenceAlias: VoxeetSDK.conference.current.alias,
                } as SubscribeParticipantJoined,
                {
                    type: 'Participant.Left' as SubscriptionType,
                    conferenceAlias: VoxeetSDK.conference.current.alias,
                } as SubscribeParticipantLeft,
            ];

            VoxeetSDK.notification.subscribe(notificationSubscriptions);
        });

        VoxeetSDK.conference.on('left', () => {
            VoxeetSDK.notification.unsubscribe(notificationSubscriptions);
        });
    };

    const onParticipantJoined = async (event: ParticipantJoinedNotification) => {
        // Add the participant in the main room
        await computeRooms();

        const myRoomId = getParticipantRoom(VoxeetSDK.session.participant);
        if (myRoomId) {
            // I am in a breakout room
            // inform the new participant to ignore me
            await sendIgnoreMe(event.participant);
        }
    };

    const onParticipantLeft = async (event: ParticipantLeftNotification) => {
        if (event.participant.id === VoxeetSDK.session.participant.id) return;
        
        // Remove the participant from any breakout room
        await moveTo(null, [event.participant]);
    };

    const createRoom = async (room: BreakoutRoom): Promise<string> => {
        // Generate a unique identifier to retrieve the room easily
        const uuid: string = uuidv4();

        breakoutRooms.set(uuid, room);

        await computeRooms();
        await sendRoomsUpdate();

        return uuid;
    };

    const closeRoom = async (id: string): Promise<void> => {
        if (!breakoutRooms.has(id)) {
            return Promise.reject(`The breakout room with the id ${id} does not exist.`);
        }

        breakoutRooms.delete(id);

        await computeRooms();
        await sendRoomsUpdate();
    };

    const moveTo = async (roomId: string | null, participants: Participant[]): Promise<void> => {
        if (roomId && !breakoutRooms.has(roomId)) {
            return Promise.reject(`The breakout room with the id ${roomId} does not exist.`);
        }

        for (const [id, breakoutRoom] of breakoutRooms) {
            if (id === roomId) {
                // Add the participants to the new room
                breakoutRoom.participants.push(...participants);
            } else {
                // Remove the participants from that room
                breakoutRoom.participants = breakoutRoom.participants.filter((p) => participants.filter((pp) => pp.id === p.id).length <= 0);
            }
        }

        await computeRooms();
        await sendRoomsUpdate();
    };

    const getParticipantRoom = (participant: Participant): string => {
        for (const [id, breakoutRoom] of breakoutRooms) {
            if (breakoutRoom.participants.filter((p) => p.id === participant.id)) {
                return id;
            }
        }

        return undefined;
    };

    const setInSameRoom = async (participant: Participant) => {
        if (!participant.audioReceivingFrom) {
            // Start the audio from the remote participant
            await VoxeetSDK.audio.remote.start(participant);
        }

        if (!VoxeetSDK.conference.current.isAudioOnly) {
            if (participant.streams && participant.streams.find((stream) => !stream.active && stream.type === 'Camera')) {
                // Start the video from the remote participant
                await VoxeetSDK.video.remote.start(participant);
            }
        }
    };

    const setInDifferentRoom = async (participant: Participant) => {
        if (participant.audioReceivingFrom) {
            // Stop the audio from the remote participant
            await VoxeetSDK.audio.remote.stop(participant);
        }

        if (!VoxeetSDK.conference.current.isAudioOnly) {
            if (participant.streams && participant.streams.find((stream) => stream.active && stream.type === 'Camera')) {
                // Stop the video from the remote participant
                await VoxeetSDK.video.remote.stop(participant);
            }
        }
    };

    const computeRooms = async () => {
        const myRoomId = getParticipantRoom(VoxeetSDK.session.participant);

        for (const [id, participant] of VoxeetSDK.conference.participants) {
            if (id === VoxeetSDK.session.participant.id || participant.status !== ('Connected' as ParticipantStatus)) {
                continue;
            }

            const pRoomId = getParticipantRoom(participant);

            if (myRoomId === pRoomId) {
                // Same room
                await setInSameRoom(participant);
            } else {
                // Different room
                await setInDifferentRoom(participant);
            }
        }
    };

    const onCommandReceive = async (participant: Participant, message: string) => {
        const payload = JSON.parse(message) as ActionCommand;
        if (!payload.action) {
            // Ignore this event
            return;
        }

        if (payload.action === COMMAND_UPDATE_NAME) {
            breakoutRooms.clear();

            const map: Map<string, BreakoutRoomCommandPayload> = JSON.parse(payload.payload);

            for (const [id, breakoutRoom] of map) {
                const participants = breakoutRoom.participants.map((pId) => VoxeetSDK.conference.participants.get(pId));
                const room: BreakoutRoom = {
                    name: breakoutRoom.name,
                    participants: participants,
                };
                breakoutRooms.set(id, room);
            }

            await computeRooms();
        } else if (payload.action === COMMAND_IGNORE_NAME) {
            await setInDifferentRoom(participant);
        }
    };

    const sendRoomsUpdate = async () => {
        const rooms = new Map<string, BreakoutRoomCommandPayload>();

        for (const [id, breakoutRoom] of breakoutRooms) {
            const participants = breakoutRoom.participants.map((p) => p.id);
            const room: BreakoutRoomCommandPayload = {
                name: breakoutRoom.name,
                participants: participants,
            };
            rooms.set(id, room);
        }

        const payload: ActionCommand = {
            action: COMMAND_UPDATE_NAME,
            payload: JSON.stringify(rooms),
        };

        await commands.send(JSON.stringify(payload), []);
    };

    const sendIgnoreMe = async (participant: Participant) => {
        const payload: ActionCommand = {
            action: COMMAND_IGNORE_NAME,
            payload: 'Ignore me',
        };

        await commands.send(JSON.stringify(payload), [participant]);
    };

    // Initialize this service
    initialize();

    return {
        breakoutRooms,
        createRoom,
        closeRoom,
        moveTo,
    };
};

export default createBreakout;
