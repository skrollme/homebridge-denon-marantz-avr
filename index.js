var Service, Characteristic;
var Denon = require('./lib/denon');
var inherits = require('util').inherits;
var pollingtoevent = require('polling-to-event');


module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory('homebridge-denon-marantz-avr', 'DenonMarantzAVR', DenonAVRAccessory);
};

function DenonAVRAccessory(log, config) {
    this.log = log;
    var that = this;

    this.config = config;
    this.ip = config['ip'];
    this.port = config['port'] || 80;

    this.name = config['name'];

    this.defaultInput = config['defaultInput'] || null;
    this.defaultVolume = config['defaultVolume'] || null;
    this.minVolume = config['minVolume'] || 0;
    this.maxVolume = config['maxVolume'] || 70;
    this.doPolling = config['doPolling'] || false;

    this.pollingInterval = config['pollingInterval'] || "60";
    this.pollingInterval = parseInt(this.pollingInterval)

    this.denon = new Denon(this.ip, this.port);

    this.setAttempt = 0;
    this.state = false;
    this.volume = this.defaultVolume;
    this.mute = false

    if (this.interval < 10 && this.interval > 100000) {
        this.log("polling interval out of range.. disabled polling");
        this.doPolling = false;
    }

    // Status Polling
    if (this.doPolling) {
        that.log("start polling..");
        var statusemitter = pollingtoevent(function(done) {
            that.log.debug("do poll state..")
            that.getPowerState( function( error, response) {
                done(error, response, this.setAttempt);
            }, "statuspoll");
        }, {longpolling: true, interval: that.pollingInterval * 1000});

        statusemitter.on("longpoll", function(data) {
            that.state = data;
            that.log.debug("poll state end, state: "+data);

            if (that.switchService ) {
                that.switchService.getCharacteristic(Characteristic.On).updateValue(that.state, null, "statuspoll");
            }
        });
        statusemitter.on("error", function(err, data) {});


        var statusemitterVolume = pollingtoevent(function(done) {
            that.log.debug("do poll vol..")
            that.getVolume( function( error, response) {
                done(error, response, this.setAttempt);
            }, "statuspollVolume");
        }, {longpolling: true, interval: that.pollingInterval * 1000});

        statusemitterVolume.on("longpoll", function(data) {
            that.volume = data;
            that.log.debug("poll vol end, vol: "+data);

            if (that.switchService) {
                that.switchService.getCharacteristic(Characteristic.Volume).updateValue(that.volume, null, "statuspollVolume");
            }
        });


        var statusemitterMute = pollingtoevent(function(done) {
            that.log.debug("do poll mute..")
            that.getMuteState( function( error, response) {
                done(error, response, this.setAttempt);
            }, "statuspollMute");
        }, {longpolling: true, interval: that.pollingInterval * 1000});

        statusemitterMute.on("longpoll", function(data) {
            that.mute = data;
            that.log.debug("poll mute end, mute: "+data);

            if (that.switchService) {
                that.switchService.getCharacteristic(Characteristic.Mute).updateValue(that.mute, null, "statuspollMute");
            }
        });
    }
}


DenonAVRAccessory.prototype.getPowerState = function (callback, context) {
    if ((!context || context != "statuspoll") && this.doPolling) {
        callback(null, this.state);
    } else {
        this.denon.getPowerState(function (err, state) {
            if (err) {
                this.log('get state error: ' + err)
                callback(null, false);
            } else {
                if (this.state != state) {
                    this.log('current power state is: %s', (state) ? 'ON' : 'OFF');
                }
                callback(null, state);
            }
        }.bind(this));
    }
};


DenonAVRAccessory.prototype.setPowerState = function (powerState, callback, context) {
    var that = this;

    //if context is statuspoll, then we need to ensure that we do not set the actual value
    if (context && context == "statuspoll") {
        callback(null, powerState);
        return;
    }

    this.denon.setPowerState(powerState, function (err, state) {
        if (err) {
            this.log(err);
            callback(null, false);
        } else {
            if(powerState && this.defaultInput) {
                this.denon.setInput(this.defaultInput, function (error) {
                    if (error) {
                        this.log('Error setting default input. Please check your config');
                    }
                }.bind(this));
            }
            this.log('denon avr powered %s', state);
        }
    }.bind(this));

    if (powerState && this.defaultVolume) {
        setTimeout(function () {
            this.denon.setVolume(this.defaultVolume, function (err) {
                if (err) {
                    this.log('Error setting default volume');
                    callback(null, false);
                }
                this.switchService.getCharacteristic(Characteristic.Volume)
                    .updateValue(Math.round(this.defaultVolume / this.maxVolume * 100));
            }.bind(this));
        }.bind(this), 4000);
    }
    callback(null);
};


DenonAVRAccessory.prototype.getVolume = function (callback, context) {
    if ((!context || context != "statuspollVolume") && this.doPolling) {
        callback(null, this.volume);
    } else {
        this.denon.getVolume(function (err, volume) {
            if (err) {
                this.log('get Volume error: ' + err)
                callback(null, 0);
            } else {
                var pVol = Math.round(volume / this.maxVolume * 100);
                if (this.volume != pVol) {
                    this.log('current volume is: ' + pVol);
                }

                callback(null, pVol);
            }
        }.bind(this))
    }
};

DenonAVRAccessory.prototype.setVolume = function (pVol, callback, context) {
    var that = this;

    //if context is statuspoll, then we need to ensure that we do not set the actual value
    if (context && context == "statuspollVolume") {
        callback(null, pVol);
        return;
    }

    var volume = Math.round(pVol / 100 * this.maxVolume);
    this.denon.setVolume(volume, function (err) {
        if (err) {
            this.log('set Volume error: ' + err);
            callback(null, 0);
        } else {
            this.log('set Volume to: ' + volume);
            callback(null);
        }
    }.bind(this))
};


DenonAVRAccessory.prototype.getMuteState = function (callback, context) {
    if ((!context || context != "statuspollMute") && this.doPolling) {
        callback(null, this.mute);
    } else {
        this.denon.getMuteState(function (err, state) {
            if (err) {
                this.log('get mute error: ' + err);
                callback(null, false);
            } else {
                if(this.mute != state) {
                    this.log('current mutestate is: ' + state);
                }

                callback(null, state);
            }
        }.bind(this))
    }
};

DenonAVRAccessory.prototype.setMuteState = function (state, callback, context) {
    var that = this;

    //if context is statuspoll, then we need to ensure that we do not set the actual value
    if (context && context == "statuspollMute") {
        callback(null, state);
        return;
    }

    this.denon.setMuteState(state, function (err) {
        if (err) {
            this.log('set mute error: ' + err);
            callback(null, false);
        } else {
            callback(null);
        }
    }.bind(this));
};

DenonAVRAccessory.prototype.getServices = function () {
    var informationService = new Service.AccessoryInformation();

    informationService
        .setCharacteristic(Characteristic.Name, this.name)
        .setCharacteristic(Characteristic.Manufacturer, this.type || 'Denon');

    this.switchService = new Service.Switch(this.name);
    this.switchService.getCharacteristic(Characteristic.On)
        .on('get', this.getPowerState.bind(this))
        .on('set', this.setPowerState.bind(this));

    this.switchService.addCharacteristic(Characteristic.Mute)
        .on('get', this.getMuteState.bind(this))
        .on('set', this.setMuteState.bind(this));

    this.switchService.addCharacteristic(Characteristic.Volume)
        .on('get', this.getVolume.bind(this))
        .on('set', this.setVolume.bind(this));

    return [informationService, this.switchService];
};
