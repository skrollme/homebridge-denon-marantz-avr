[![npm](https://img.shields.io/npm/v/homebridge-denon-x.svg?style=plastic)](https://www.npmjs.com/package/homebridge-denon-x)
[![npm](https://img.shields.io/npm/dt/homebridge-denon-x.svg?style=plastic)](https://www.npmjs.com/package/homebridge-denon-x)
[![GitHub last commit](https://img.shields.io/github/last-commit/skrollme/homebridge-denon-marantz-avr.svg?style=plastic)](https://github.com/skrollme/homebridge-denon-marantz-avr)

# Homebridge-Denon-Marantz-AVR-X
homebridge-plugin for Denon and Marantz AVR control with Apple-Homekit. Works with most Denon AVR since 2011.

**This is a fork of [homebridge-denon-marantz-avr](https://github.com/stfnhmplr/homebridge-denon-marantz-avr) before it was refactored to work as a platform-plugin. For me (Marantz NR-1506 AVR) this versions (0.4) did not work very well, so I forked and continued at a state which worked for me.**

# Installation
Follow the instruction in [NPM](https://www.npmjs.com/package/homebridge) for the homebridge server installation. The plugin is published through [NPM](https://www.npmjs.com/package/homebridge-denon) and should be installed "globally" by typing:

    sudo npm install -g homebridge-denon-x

# Configuration

config.json

Example:

    {
      "bridge": {
          "name": "Homebridge",
          "username": "CC:22:3D:E3:CE:51",
          "port": 51826,
          "pin": "031-45-154"
      },
      "description": "This is an example configuration file for homebridge denon plugin",
      "hint": "Always paste into jsonlint.com validation page before starting your homebridge, saves a lot of frustration",
      "accessories": [
          {
              "accessory": "DenonMarantzAVR",
              "name": "Denon LivingRoom",
              "ip": "192.168.1.99",
              "port": 8080,
              "defaultInput": "IRADIO",
              "defaultVolume": 35,
              "minVolume": 10,
              "maxVolume": 75,
              "doPolling": true,
              "pollingInterval": 60
          }
      ]
  }

## possible default inputs
Setting the default input and the default volume is optional. The available inputs depends on your avr model. Please check the official manuals from Denon. https://usa.denon.com/us/downloads/manuals-and-downloads

- 'CD'
- 'SPOTIFY'
- 'CBL/SAT'
- 'SAT/CBL'
- 'DVD'
- 'BD' (Bluray)
- 'GAME'
- 'GAME2'
- 'AUX1'
- 'MPLAY' (Media Player)
- 'USB/IPOD'
- 'TUNER'
- 'NETWORK'
- 'TV'
- 'IRADIO' (Internet Radio)
- 'DOCK'
- 'IPOD'
- 'NET/USB'
- 'RHAPSODY'
- 'PANDORA'
- 'LASTFM'
- 'IRP'
- 'FAVORITES'
- 'SERVER'
- 'FLICKR'
- 'NAPSTER'
- 'HDRADIO'


### notes
If you are interested in setting the volume of your receiver with Siri than [this](https://github.com/robertvorthman/homebridge-marantz-volume) plugin might be a good addition. Only remember to not tell Siri "Set the light in the Living room to 100 %" ;)
homebridge-marantz-volume was written by Robert Vorthman (thanks!)

## what else

Like this and want to express your feelings? Please buy me a beer :beers: ...

[![Donate](https://img.shields.io/badge/Donate-PayPal-blue.svg)](https://www.paypal.me/skroll)
