import { EventEmitter } from 'events';
import { Participant } from '@voxeet/voxeet-web-sdk/types/models/Participant';
import './__mocks__/MediaStream.mock';
import './__mocks__/navigator.mock';
import Commands from '../src/commands';
import { TargetedCommand } from '../src/types/Commands';

var mockedParticipant: any = undefined;
var sentMessage: string;
const mockedCommandSend = jest.fn(
    (message: string) =>
        new Promise((resolve) => {
            sentMessage = message;
            resolve({});
        })
);

const eventEmitter = new EventEmitter();
(<any>eventEmitter).send = mockedCommandSend;

jest.mock('@voxeet/voxeet-web-sdk', () => ({
    get session() {
        return {
            get participant() {
                return mockedParticipant;
            },
        };
    },
    get command() {
        return eventEmitter;
    },
}));

describe('commands test suite', () => {
    let commands: Commands;

    beforeEach(() => {
        commands = new Commands();
    });

    test('commands should match the snapshot', () => {
        expect(commands).toMatchSnapshot();
    });

    test('send a command', async () => {
        await commands.send('message', []);

        expect(mockedCommandSend).toHaveBeenCalled();

        let cmd = JSON.parse(sentMessage) as TargetedCommand;
        expect(cmd.message).toEqual('message');
        expect(cmd.target).toEqual([]);

        await commands.send('message', [
            <any>{
                id: '000',
            },
        ]);

        expect(mockedCommandSend).toHaveBeenCalledTimes(2);

        cmd = JSON.parse(sentMessage) as TargetedCommand;
        expect(cmd.message).toEqual('message');
        expect(cmd.target).toEqual(['000']);
    });

    test('received a command', async () => {
        let participant: Participant | null = null;
        let message: string | null = null;

        const onReceived = jest.fn((p: Participant, m: string) => {
            participant = p;
            message = m;
        });
        commands.on('received', onReceived);

        let payload: TargetedCommand = {
            target: [],
            message: 'this is the message',
        };
        eventEmitter.emit('received', null /* participant */, JSON.stringify(payload));

        expect(onReceived).toHaveBeenCalled();
        expect(participant).toBeNull();
        expect(message).toBe('this is the message');

        /* With a target */

        mockedParticipant = {
            id: '123',
            info: { name: 'toto' },
        };

        payload = {
            target: ['000'],
            message: 'this is the message',
        };
        eventEmitter.emit('received', null /* participant */, JSON.stringify(payload));

        expect(onReceived).toHaveBeenCalled();
        expect(participant).toBeNull();
        expect(message).toBe('this is the message');
    });

    test('received a wrong command', async () => {
        const onReceived = jest.fn((p: Participant, m: string) => {});
        commands.on('received', onReceived);

        eventEmitter.emit('received', null /* participant */, JSON.stringify({}));

        expect(onReceived).toHaveBeenCalledTimes(0);
    });
});
