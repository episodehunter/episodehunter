# Episodehunter 📺

> mono repo for episodehunter

<p align="center">
  <a href="https://episodehunter.tv/">
    <img alt="episodehunter" src="https://avatars2.githubusercontent.com/u/16175008" width="100">
  </a>
</p>

[![codecov](https://codecov.io/gh/episodehunter/episodehunter/branch/master/graph/badge.svg)](https://codecov.io/gh/episodehunter/episodehunter)

## Into

Episodehunter is a open source project to track what tv shows you are watching. Works with Plex, Kodi and Google Home.

## Services

### Dragonstone 🏯

The heart of all data. This service expose an api to access and manipulate the stored data.

### Scrobble 📺

Expose a api for plex and kodi to register what the user is watching

### Logger 📗

A simple log service

### Kingsguard ⚔️

A service for better error handling

### TheTvDB 👽

Helper lib for the tv db api

### Types 🌀

Share typescript types

### Show update 🔄

A service that adds and update tv shows

### Scheduler ⏰

Like cron job for episodehunter

### Image proxy 🖼

Fetching images and manipulate them on the fly

### Utils 🛠

Util functions for episodehunter

### Firebase fn

Specific functions for firebase

### Developing

Bootstrap

```
npx lerna bootstrap
```

Test:

```
npx lerna run test
```
