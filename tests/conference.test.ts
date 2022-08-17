import './__mocks__/MediaStream.mock';
import './__mocks__/navigator.mock';
import createConferencing from '../src/conference';
import { Conferencing } from '../src/types/Conference';
import { Participant, ParticipantType } from '@voxeet/voxeet-web-sdk/types/models/Participant';
import { MediaStreamWithType } from '@voxeet/voxeet-web-sdk/types/models/MediaStream';

var mockedParticipant: any = undefined;
var mockedConferenceCurrent: any = undefined;
const mockedConferenceLeave = jest.fn(() => new Promise((resolve) => resolve({})));
const mockedConferenceFetch = jest.fn((confId) => new Promise((resolve) => resolve({ id: confId })));
const mockedConferenceJoinListen = jest.fn((conf, options) => new Promise((resolve) => resolve({ id: conf.id })));

jest.mock('@voxeet/voxeet-web-sdk', () => ({
    get session() {
        return {
            get participant() {
                return mockedParticipant;
            },
        };
    },
    get conference() {
        return {
            leave: mockedConferenceLeave,
            fetch: mockedConferenceFetch,
            join: mockedConferenceJoinListen,
            listen: mockedConferenceJoinListen,
            get current() {
                return mockedConferenceCurrent;
            },
        };
    },
}));

describe('conference test suite', () => {
    let conference: Conferencing;

    beforeEach(() => {
        conference = createConferencing();
    });

    test('conference should match the snapshot', () => {
        expect(conference).toMatchSnapshot();
    });

    test('attachMediaStreamToHTMLVideoElement', () => {
        const mswt = Object.assign(new MediaStream(), { type: 'Camera' });
        const part: Participant = {
            id: 'participant-id',
            streams: [mswt as MediaStreamWithType],
        } as Participant;

        const videoNode = conference.attachMediaStreamToHTMLVideoElement(part);
        expect(videoNode).toBeDefined();
        expect(videoNode.muted).toBeTruthy();
        expect(videoNode.attributes.getNamedItem('playsinline')?.value).toBe('true');
        expect(videoNode.attributes.getNamedItem('autoplay')?.value).toBe('autoplay');
    });

    test('switchToUser', async () => {
        mockedParticipant = {
            id: '123',
            info: { name: 'toto' },
            type: 'listener' as ParticipantType,
        };

        mockedConferenceCurrent = {
            id: '000',
        };

        await conference.switchToUser({});

        expect(mockedConferenceFetch).toHaveBeenCalled();
        expect(mockedConferenceJoinListen).toHaveBeenCalled();
    });

    test('Exceptions - switchToUser', async () => {
        mockedParticipant = undefined;
        mockedConferenceCurrent = undefined;

        try {
            await conference.switchToUser({});
        } catch (e) {
            expect(e).toEqual('A session is not opened.');
        }

        mockedParticipant = {
            id: '123',
            info: { name: 'toto' },
            type: 'user' as ParticipantType,
        };

        try {
            await conference.switchToUser({});
        } catch (e) {
            expect(e).toEqual('Already joined as a USER.');
        }

        mockedParticipant.type = 'listener' as ParticipantType;

        try {
            await conference.switchToUser({});
        } catch (e) {
            expect(e).toEqual('You must be connected to a conference.');
        }
    });

    test('switchToListener', async () => {
        mockedParticipant = {
            id: '123',
            info: { name: 'toto' },
            type: 'user' as ParticipantType,
        };

        mockedConferenceCurrent = {
            id: '000',
        };

        await conference.switchToListener();

        expect(mockedConferenceFetch).toHaveBeenCalled();
        expect(mockedConferenceJoinListen).toHaveBeenCalled();
    });

    test('switchToListener with options', async () => {
        mockedParticipant = {
            id: '123',
            info: { name: 'toto' },
            type: 'user' as ParticipantType,
        };

        mockedConferenceCurrent = {
            id: '000',
        };

        await conference.switchToListener({ maxVideoForwarding: 14 });

        expect(mockedConferenceFetch).toHaveBeenCalled();
        expect(mockedConferenceJoinListen).toHaveBeenCalled();
    });

    test('Exceptions - switchToListener', async () => {
        mockedParticipant = undefined;
        mockedConferenceCurrent = undefined;

        try {
            await conference.switchToListener({});
        } catch (e) {
            expect(e).toEqual('A session is not opened.');
        }

        mockedParticipant = {
            id: '123',
            info: { name: 'toto' },
            type: 'listener' as ParticipantType,
        };

        try {
            await conference.switchToListener({});
        } catch (e) {
            expect(e).toEqual('Already joined as a LISTENER.');
        }

        mockedParticipant.type = 'user' as ParticipantType;

        try {
            await conference.switchToListener({});
        } catch (e) {
            expect(e).toEqual('You must be connected to a conference.');
        }
    });
});
