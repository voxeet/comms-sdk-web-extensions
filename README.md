# Dolby.io Communications APIs SDK for Web Extensions

This project is a series of extensions for the Dolby.io Communications SDK for Web.

## Install this project

Run the npm command to install the package `@dolbyio/comms-sdk-web-extensions` into your project:

```bash
npm install @dolbyio/comms-sdk-web-extensions --save
```

## Capabilities

### Private Zones

Using the Spatial Audio capability, you now have the possibility to create private zones. Those are areas in your audio scene where only people in the zone can talk to each other.

```ts
const zone = {
    origin: {
        x: 0, y: 0, z: 0
    },
    dimension: {
        x: 100, y: 100, z: 100
    },
    scale: {
        x: 10, y: 10, z: 10,
    },
};
// Create a new private zone with the rules set above in the zone object
const zoneId = await VoxeetSDKExt.privateZones.createPrivateZone(zone);
```

When using private zone, you MUST rely on the `setSpatialPosition` function from the `privateZones` object to move a participant at a different location.

```ts
// Set a participant position in that private zone
const position = { x: 22, y: 33, z: 44 };
await VoxeetSDKExt.privateZones.setSpatialPosition(participant, position);

// Update the zone origin
zone.origin = {
    x: 100, y: 50, z: 0
};
await VoxeetSDKExt.privateZones.updatePrivateZone(zoneId, zone);

// Delete the zone
await VoxeetSDKExt.privateZones.deletePrivateZone(zoneId);
```

### Conference

Add the possibility to switch from a user to a listener and from a listener to a user. Get an HTML video element for a specified participant.

```ts
// Get an video HTML element for a specific participant
const videoElement = VoxeetSDKExt.conference.attachMediaStreamToHTMLVideoElement(participant);

// Switch the current user into a listener
await VoxeetSDKExt.conference.switchToListener();

// Switch the current listener into a user
await VoxeetSDKExt.conference.switchToUser({
    constraints: { video: false, audio: true}
});
```

### Commands

Send a command to a specific participant in a conference.

**Note:** The commands are sent to all participants and filtered by this extension if the local participant is not in the target list.

```ts
// Listen to an incoming message for the local participant
VoxeetSDKExt.commands.on('received', (participant, message) => {
    console.log(`The participant ${participant.id} has sent the following message: ${message}`);
});

// Send a message to a couple of participants
await VoxeetSDKExt.commands.send('message', [ participantA, participantB ]);

// Send a message all the participants in the conference
await VoxeetSDKExt.commands.send('message', [ ]);
```

### Breakout Rooms

Create dynamic breakout rooms within a conference. By default all new participant join the main room. Then, you can create new breakout rooms and move participants into them.

```ts
// It's important to initialize the breakout room capability before using it
await VoxeetSDKExt.breakout.initialize();

// Create a new room and move participants into it
const room = {
    name: 'Video games',
    participants: [
        participantA,
        participantB,
        participantC,
    ]
}
const roomId = await VoxeetSDKExt.breakout.createRoom(room);

// Move a participant into that previously created room
await VoxeetSDKExt.breakout.moveTo(roomId, [ participantD ]);

// You can also move a participant back into the main room
await VoxeetSDKExt.breakout.moveTo(null, [ participantA ]);

// And closing a room will move all the participant into the main room
await VoxeetSDKExt.breakout.closeRoom(roomId);
```

## How to

Run tests:

```bash
npm run test
```

Create distribution package:

```bash
npm run build
```
