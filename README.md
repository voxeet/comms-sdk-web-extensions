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

### Conference

Add the possibility to switch from a user to a listener and from a listener to a user. Get an HTML video element for a specified participant.

### Commands

Send a command to a specific participant in a conference.

**Note:** The commands are sent to all participants and filtered by this extension if the local participant is not in the target list.

## How to

Run tests:

```bash
npm run test
```

Create distribution package:

```bash
npm run build
```
