import './__mocks__/MediaStream.mock';
import './__mocks__/navigator.mock';
import createPrivateZones from '../src/privateZones';
import { PrivateZones, Zone } from '../src/types/PrivateZones';
import { SpatialEnvironment, SpatialPosition, SpatialScale } from '@voxeet/voxeet-web-sdk/types/models/SpatialAudio';

let spatialEnvironment: SpatialEnvironment;

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
            setSpatialEnvironment: (scale: SpatialScale, forward: SpatialPosition, up: SpatialPosition, right: SpatialPosition) =>
                mockSetSpatialEnvironment(scale, forward, up, right),
        };
    },
}));

describe('private zones test suite', () => {
    let privateZones: PrivateZones;
    const zone: Zone = { origin: { x: 0, y: 0, z: 0 }, dimension: { x: 2, y: 2, z: 2 }, scale: { x: 1, y: 1, z: 1 } };

    beforeEach(() => {
        privateZones = createPrivateZones();
    });

    test('instance should match the snapshot', () => {
        expect(privateZones).toMatchSnapshot();
    });

    test('returned zones should included the one just created', async () => {
        // act
        await privateZones.createZone(zone);

        const zonesValues = Array.from(privateZones.zones.values());

        expect(zonesValues[0]).toMatchSnapshot();
    });

    test('first private zone should be updated', async () => {
        privateZones.createZone(zone);

        const zonesValues = Array.from(privateZones.zones.values());
        expect(zonesValues[0]).toMatchSnapshot();

        // retrieve zone ids
        const idsIterator = privateZones.zones.keys();
        const updatedZone: Zone = { origin: { x: 1, y: 1, z: 1 }, dimension: { x: 2, y: 2, z: 2 }, scale: { x: 1, y: 1, z: 1 } };

        // act
        await privateZones.updateZone(idsIterator.next().value, updatedZone);

        // assert (check if zone was updated)
        const updatedZonesValues = Array.from(privateZones.zones.values());
        expect(updatedZonesValues[0]).toMatchSnapshot();
    });

    test('private zones should be empty after deleting the last item', async () => {
        privateZones.createZone(zone);

        const zonesValues = Array.from(privateZones.zones.values());
        expect(zonesValues[0]).toMatchSnapshot();

        const idsIterator = privateZones.zones.keys();

        await privateZones.deleteZone(idsIterator.next().value);

        const updatedZonesValues = Array.from(privateZones.zones.values());
        expect(updatedZonesValues).toMatchSnapshot(); // empty array
    });

    test('setSpatialPosition should trigger side effects', async () => {});

    test('Exceptions - updatePrivateZone', async () => {
        const wrongId = 'wrong-id';

        try {
            await privateZones.updateZone(wrongId, {
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
            await privateZones.deleteZone(wrongId);
        } catch (e) {
            expect(e).toEqual(`The private zone with the id ${wrongId} does not exist.`);
        }
    });

    test('setSpatialEnvironment', () => {
        privateZones.setSpatialEnvironment({ x: 10, y: 10, z: 10 }, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 }, { x: 1, y: 1, z: 1 });
        expect(spatialEnvironment).toMatchSnapshot();
    });
});
