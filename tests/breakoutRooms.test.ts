import { EventEmitter } from 'events';
import './__mocks__/MediaStream.mock';
import './__mocks__/navigator.mock';
import createBreakout from '../src/breakout';
import Commands from '../src/commands';
import { Breakout, BreakoutRoom } from '../src/types/Breakout';

var mockedParticipant: any = { id: '000' };
const mockedCommandSend = jest.fn((message: string) => new Promise((resolve) => resolve({})));

const conferenceMock = new EventEmitter();
var ps: Map<string, any> = new Map<string, any>();
ps.set('000', { id: '000' });
ps.set('111', { id: '111' });
ps.set('222', { id: '222' });

(<any>conferenceMock).participants = ps;

const commandMock = new EventEmitter();
(<any>commandMock).send = mockedCommandSend;

jest.mock('@voxeet/voxeet-web-sdk', () => ({
    get conference() {
        return conferenceMock;
    },
    get command() {
        return commandMock;
    },
    get notification() {
        return new EventEmitter();
    },
    get session() {
        return {
            get participant() {
                return mockedParticipant;
            },
        };
    },
}));

describe('breakoutRooms test suite', () => {
    let breakout: Breakout;

    beforeEach(() => {
        const commands = new Commands();
        breakout = createBreakout(commands);
    });

    test('breakoutRooms should match the snapshot', () => {
        expect(breakout).toMatchSnapshot();
    });

    test('breakoutRooms createRoom', async () => {
        const br: BreakoutRoom = {
            name: 'first',
            participants: [],
        };
        const roomId = await breakout.createRoom(br);

        expect(breakout.breakoutRooms.size).toEqual(1);

        await breakout.closeRoom(roomId);

        expect(breakout.breakoutRooms.size).toEqual(0);
    });

    test('breakoutRooms moveTo', async () => {
        const br: BreakoutRoom = {
            name: 'first',
            participants: [],
        };
        const roomId = await breakout.createRoom(br);

        // Create another room
        const br2: BreakoutRoom = {
            name: 'second',
            participants: [],
        };
        await breakout.createRoom(br2);

        await breakout.moveTo(roomId, [<any>{ id: '000' }]);

        expect(breakout.breakoutRooms.size).toEqual(2);
        expect(breakout.breakoutRooms.get(roomId)?.participants.length).toEqual(1);
    });

    test('Exceptions - moveTo', async () => {
        const wrongId = 'wrong-id';

        try {
            await breakout.moveTo(wrongId, []);
        } catch (e) {
            expect(e).toEqual(`The breakout room with the id ${wrongId} does not exist.`);
        }
    });

    test('breakoutRooms moveToMainRoom', async () => {
        const br: BreakoutRoom = {
            name: 'first',
            participants: [<any>{ id: '000' }],
        };
        const roomId = await breakout.createRoom(br);

        expect(breakout.breakoutRooms.size).toEqual(1);
        expect(breakout.breakoutRooms.get(roomId)?.participants.length).toEqual(1);

        // Move to the main room
        await breakout.moveToMainRoom([<any>{ id: '000' }]);

        expect(breakout.breakoutRooms.size).toEqual(1);
        expect(breakout.breakoutRooms.get(roomId)?.participants.length).toEqual(0);
    });

    test('Exceptions - closeRoom', async () => {
        const wrongId = 'wrong-id';

        try {
            await breakout.closeRoom(wrongId);
        } catch (e) {
            expect(e).toEqual(`The breakout room with the id ${wrongId} does not exist.`);
        }
    });
});
