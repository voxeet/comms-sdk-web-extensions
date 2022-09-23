import VoxeetSDK from '@voxeet/voxeet-web-sdk';
import { SpatialPosition, SpatialScale } from '@voxeet/voxeet-web-sdk/types/models/SpatialAudio';
import { Participant, ParticipantStatus } from '@voxeet/voxeet-web-sdk/types/models/Participant';
import { v4 as uuidv4 } from 'uuid';

import { Zone, Zones, CreateSpatialAudio } from './types/SpatialAudio';

const createSpatialAudio: CreateSpatialAudio = () => {
    let globalScale: SpatialScale;
    let globalForward: SpatialPosition;
    let globalUp: SpatialPosition;
    let globalRight: SpatialPosition;

    let privateZones: Zones = new Map<string, Zone>();
    let participantsPositions: Map<string, NonNullable<SpatialPosition>> = new Map<string, NonNullable<SpatialPosition>>();

    const isInZone = (position: NonNullable<SpatialPosition>, zone: Zone): boolean => {
        if (position.x < zone.origin.x || position.x > zone.origin.x + zone.dimension.x) {
            return false;
        }
        if (position.y < zone.origin.y || position.y > zone.origin.y + zone.dimension.y) {
            return false;
        }
        return !(position.z < zone.origin.z || position.z > zone.origin.z + zone.dimension.z);
    };

    const getZone = (position: NonNullable<SpatialPosition>): [string, Zone] | undefined => {
        for (const [id, zone] of privateZones.entries()) {
            if (isInZone(position, zone)) {
                // Only return the first one
                return [id, zone];
            }
        }

        return [undefined, undefined];
    };

    const computeStatus = async () => {
        // No need to compute if the local participant is not in the audio scene
        if (VoxeetSDK.session.participant && !participantsPositions.has(VoxeetSDK.session.participant.id)) return;
        // or if there are no other participants
        if (participantsPositions.size <= 1) return;

        // Get the zone of the local participant
        const localPosition: SpatialPosition = participantsPositions.get(VoxeetSDK.session.participant.id);
        const [localZoneId, localZone] = getZone(localPosition);

        for (const [id, participant] of VoxeetSDK.conference.participants) {
            if (id === VoxeetSDK.session.participant.id || participant.status !== ('Connected' as ParticipantStatus) || !participantsPositions.has(id)) {
                continue;
            }

            const remotePosition: SpatialPosition = participantsPositions.get(id);
            const [remoteZoneId, remoteZone] = getZone(remotePosition);

            if ((!localZone && !remoteZone) || localZoneId === remoteZoneId) {
                // The remote participant is in same zone

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
            } else {
                // This participant is in a different zone

                if (participant.audioReceivingFrom) {
                    // Stop the audio from the remote participant
                    await VoxeetSDK.audio.remote.stop(participant);
                }

                if (!VoxeetSDK.conference.current.isAudioOnly) {
                    if (!localZone || localZone.videoRestriction || !remoteZone || remoteZone.videoRestriction) {
                        if (participant.streams && participant.streams.find((stream) => stream.active && stream.type === 'Camera')) {
                            // Stop the video from the remote participant
                            await VoxeetSDK.video.remote.stop(participant);
                        }
                    }
                }
            }
        }
    };

    const setSpatialEnvironment = (scale: SpatialScale, forward: SpatialPosition, up: SpatialPosition, right: SpatialPosition) => {
        VoxeetSDK.conference.setSpatialEnvironment(scale, forward, up, right);

        globalScale = scale;
        globalForward = forward;
        globalUp = up;
        globalRight = right;
    };

    const createPrivateZone = async (zone: Zone): Promise<string> => {
        if (!zone.videoRestriction) {
            zone.videoRestriction = false;
        }

        // Generate a unique identifier to retrieve the zone easily
        const uuid: string = uuidv4();

        privateZones.set(uuid, zone);

        await computeStatus();

        return uuid;
    };

    const deletePrivateZone = async (id: string): Promise<void> => {
        if (!privateZones.has(id)) {
            return Promise.reject(`The private zone with the id ${id} does not exist.`);
        }

        privateZones.delete(id);

        await computeStatus();
    };

    const updatePrivateZone = async (id: string, zone: Zone): Promise<void> => {
        if (!privateZones.has(id)) {
            return Promise.reject(`The private zone with the id ${id} does not exist.`);
        }

        if (!zone.videoRestriction) {
            zone.videoRestriction = false;
        }

        privateZones.set(id, zone);

        await computeStatus();
    };

    const setSpatialPosition = async (participant: Participant, position: NonNullable<SpatialPosition>): Promise<void> => {
        if (participant.id === VoxeetSDK.session.participant.id && participantsPositions.has(VoxeetSDK.session.participant.id)) {
            const previousPosition: SpatialPosition = participantsPositions.get(VoxeetSDK.session.participant.id);
            const [previousZoneId, _] = getZone(previousPosition);
            const [newZoneId, newZone] = getZone(position);

            if (previousZoneId !== newZoneId) {
                if (newZone) {
                    VoxeetSDK.conference.setSpatialEnvironment(newZone.scale, globalForward, globalUp, globalRight);
                } else {
                    VoxeetSDK.conference.setSpatialEnvironment(globalScale, globalForward, globalUp, globalRight);
                }
            }
        }

        VoxeetSDK.conference.setSpatialPosition(participant, position);
        participantsPositions.set(participant.id, position);

        await computeStatus();
    };

    return { setSpatialEnvironment, createPrivateZone, deletePrivateZone, privateZones, updatePrivateZone, setSpatialPosition };
};

export default createSpatialAudio;
