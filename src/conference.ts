import VoxeetSDK from '@voxeet/voxeet-web-sdk';
import { JoinOptions, ListenOptions } from '@voxeet/voxeet-web-sdk/types/models/Options';
import { Participant, ParticipantType } from '@voxeet/voxeet-web-sdk/types/models/Participant';

import { RTCShim } from './types/RTCShim';
import { CreateConferencing } from './types/Conference';

const createConferencing: CreateConferencing = () => {
    const attachMediaStreamToHTMLVideoElement = (participant: Participant) => {
        const videoNode = document.createElement('video');

        videoNode.setAttribute('playsinline', 'true');
        videoNode.setAttribute('autoplay', 'autoplay');
        videoNode.muted = true;

        (navigator as Navigator & RTCShim).attachMediaStream(videoNode, participant.streams[0]);

        return videoNode;
    };

    const switchToUser = async (options: JoinOptions) => {
        if (!VoxeetSDK.session.participant) {
            return Promise.reject('A session is not opened.');
        }

        if (VoxeetSDK.session.participant.type === ('user' as ParticipantType)) {
            return Promise.reject('Already joined as a USER.');
        }

        if (!VoxeetSDK.conference.current) {
            return Promise.reject('You must be connected to a conference.');
        }

        const confId = VoxeetSDK.conference.current.id;

        return VoxeetSDK.conference
            .leave()
            .then(() => VoxeetSDK.conference.fetch(confId))
            .then((conf) => VoxeetSDK.conference.join(conf, options));
    };

    const switchToListener = async (options?: ListenOptions) => {
        if (!VoxeetSDK.session.participant) {
            return Promise.reject('A session is not opened.');
        }

        if (VoxeetSDK.session.participant.type === ('listener' as ParticipantType)) {
            return Promise.reject('Already joined as a LISTENER.');
        }

        if (!VoxeetSDK.conference.current) {
            return Promise.reject('You must be connected to a conference.');
        }

        const confId = VoxeetSDK.conference.current.id;

        return VoxeetSDK.conference
            .leave()
            .then(() => VoxeetSDK.conference.fetch(confId))
            .then((conf) => {
                if (options) {
                    return VoxeetSDK.conference.listen(conf, options);
                }

                return VoxeetSDK.conference.listen(conf);
            });
    };

    return {
        attachMediaStreamToHTMLVideoElement,
        switchToUser,
        switchToListener,
    };
};

export default createConferencing;
