import './__mocks__/MediaStream.mock';
import './__mocks__/navigator.mock';
import createSpatialAudio from '../src/spatialAudio';
import { SpatialAudio, Zone } from '../src/types/SpatialAudio';

var spatialEnvironment: any;

const mockSetSpatialEnvironment = jest.fn((scale, forward, up, right) => {
    spatialEnvironment = {
        scale,
        forward,
        up,
        right,
    };
});

jest.mock('@voxeet/voxeet-web-sdk', () => ({
    get session() {
        return {};
    },
    get conference() {
        return {
            setSpatialEnvironment: (scale, forward, up, right) => mockSetSpatialEnvironment(scale, forward, up, right),
        };
    },
}));

describe('spatial audio test suite', () => {
    let spatialAudio: SpatialAudio;
    const zone: Zone = { origin: { x: 0, y: 0, z: 0 }, dimension: { x: 2, y: 2, z: 2 }, scale: { x: 1, y: 1, z: 1 } };

    beforeEach(() => {
        spatialAudio = createSpatialAudio();
    });

    test('instance should match the snapshot', () => {
        expect(spatialAudio).toMatchSnapshot();
    });

    test('returned zones should included the one just created', async () => {
        // act
        await spatialAudio.createPrivateZone(zone);

        const zonesValues = Array.from(spatialAudio.privateZones.values());

        expect(zonesValues[0]).toMatchSnapshot();
    });

    test('first private zone should be updated', async () => {
        spatialAudio.createPrivateZone(zone);

        const zonesValues = Array.from(spatialAudio.privateZones.values());
        expect(zonesValues[0]).toMatchSnapshot();

        // retrieve zone ids
        const idsIterator = spatialAudio.privateZones.keys();
        const updatedZone: Zone = { origin: { x: 1, y: 1, z: 1 }, dimension: { x: 2, y: 2, z: 2 }, scale: { x: 1, y: 1, z: 1 } };

        // act
        await spatialAudio.updatePrivateZone(idsIterator.next().value, updatedZone);

        // assert (check if zone was updated)
        const updatedZonesValues = Array.from(spatialAudio.privateZones.values());
        expect(updatedZonesValues[0]).toMatchSnapshot();
    });

    test('private zones should be empty after deleting the last item', async () => {
        spatialAudio.createPrivateZone(zone);

        const zonesValues = Array.from(spatialAudio.privateZones.values());
        expect(zonesValues[0]).toMatchSnapshot();

        const idsIterator = spatialAudio.privateZones.keys();

        await spatialAudio.deletePrivateZone(idsIterator.next().value);

        const updatedZonesValues = Array.from(spatialAudio.privateZones.values());
        expect(updatedZonesValues).toMatchSnapshot(); // empty array
    });

    test('setSpatialPosition should trigger side effects', async () => {});

    test('Exceptions - updatePrivateZone', async () => {
        const wrongId = 'wrong-id';

        try {
            await spatialAudio.updatePrivateZone(wrongId, {
                dimension: { x: 100, y: 100, z: 100 },
                origin: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
            });
        } catch (e) {
            expect(e).toEqual(`The private zone with the id ${wrongId} does not exist.`);
        }
    });

    test('Exceptions - deletePrivateZone', async () => {
        const wrongId = 'wrong-id';

        try {
            await spatialAudio.deletePrivateZone(wrongId);
        } catch (e) {
            expect(e).toEqual(`The private zone with the id ${wrongId} does not exist.`);
        }
    });

    test('setSpatialEnvironment', () => {
        spatialAudio.setSpatialEnvironment({ x: 10, y: 10, z: 10 }, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 }, { x: 1, y: 1, z: 1 });
        expect(spatialEnvironment).toMatchSnapshot();
    });
});
