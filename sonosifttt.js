/*
* sonosifttt.js
* make your sonos system into a channel on ifttt
*
*/
"use strict";
var express = require('express');
var ifttt = require('express-ifttt');
var SonosDiscovery = require('sonos-discovery');
var discovery = new SonosDiscovery();
var tts = require('node-tts-api');

var app = express();

var queueSave = {};

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (obj.indexOf(this[i].toLowerCase()) !== (-1)) {
            return true;
        }
    }
    return false;
};

// Look for changes to players' state (stopping and starting)
// Used to reset the queue after a player responds to the "say" command
discovery.on('transport-state', function(data) {
    if (!queueSave[data.uuid]) return;
    if (!queueSave[data.uuid]['started']) {
        queueSave[data.uuid]['started'] = true;
        return;
    }
    var player = discovery.getPlayerByUUID(data.uuid);
    if (player.state.currentState !== 'PAUSED_PLAYBACK' && player.state.currentState !== 'STOPPED') return;
    player.setAVTransportURI(queueSave[data.uuid]['favURI'], '', function(success) {
        player.seek(queueSave[data.uuid]['favTrack'], function() {
            queueSave[data.uuid] = null;
        });
    });
});

app.post('/xmlrpc.php', ifttt, function(req, res) {

    var players = [];
    var playerUUIDs = [];
    // Get all of the players mentioned in this command
    for (var i = 0; i < req.body.mt_keywords.length; i++) {
        var player = discovery.getPlayer(req.body.mt_keywords[i]);
        if (!player) continue;
        var playerInfo = player.convertToSimple();
        if (playerInfo.uuid != playerInfo.coordinator) {
            player = discovery.getPlayerByUUID(playerInfo.coordinator);
            if (!player) continue;
        }
        if (playerUUIDs.indexOf(player.uuid) == -1) {
            playerUUIDs.push(player.uuid);
            players.push(player);
        }
    }

    if (req.body.title.toLowerCase() === 'play') {
        for (var i = 0; i < players.length; i++) {
            var player = players[i];
            player.play();
        }
    }
    if (req.body.title.toLowerCase() === 'pause') {
        for (var i = 0; i < players.length; i++) {
            var player = players[i];
            player.pause();
        }
    }
    if (req.body.title.toLowerCase() === 'favorite') {
        for (var i = 0; i < players.length; i++) {
            var player = players[i];
            if (player.state.currentState === 'PLAYING') continue;
            player.replaceWithFavorite(req.body.description, function(err) {
                if (err) {
                    console.error(err);
                    return;
                }
                
                player.play();
            });
        }
    }
    // Say text, using the tts-api service
    if (req.body.title.toLowerCase() === 'say') {
        var textURL;
        tts.getSpeech(req.body.description, function(error, link) {
            if (error) return;
            textURL = link;
            for (var i = 0; i < players.length; i++) {
                var player = players[i];
                if (player.state.currentState === 'PLAYING') continue;
                var favURI = player.avTransportUri;
                var favTrack = favTrack = player.state.trackNo;
                player.setAVTransportURI(textURL, '', function(success) {
                    player.play(function() {
                        queueSave[player.uuid] = {
                            favTrack: favTrack,
                            favURI: favURI,
                            started: false
                        };
                    });
                });
            }
        });

    }
    res.send(200);
});

app.listen(3000);
