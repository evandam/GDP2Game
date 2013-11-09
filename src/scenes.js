// Holds all of the scenes that the game will use,
// Including the main menu, stages, and the victory/defeat screens

// Display a splash screen while all of the assets are loading.
Crafty.scene('Loading', function () {
    
    var status = Crafty.e('2D, DOM, Text')
        .text('Loading game assets!')
        .attr({
            x: Game.width() / 2 - 50,
            y: Game.height() / 2 - 24,
            w: Game.width()
        });

    // All of the audio/graphics the game will use
    Crafty.load([
        'assets/hammer.gif',
        'assets/map_sprites.png',
        'assets/falcon.gif',
        'assets/fox.gif',
        'assets/punch.wav',
        'assets/kung-fu-punch.wav',
        'assets/cool-theme-song.wav'
    ], function (e) {    
        // onLoad - assets are ready to be used

        // add the audio - bug when adding all in single object?
        Crafty.audio.add('punch1', 'assets/punch.wav');
        Crafty.audio.add('punch2', 'assets/kung-fu-punch.wav');
        Crafty.audio.add('theme', 'assets/cool-theme-song.wav');

        // make the sprites
        // falcon 0,0 = standing left, 1,0 = right, 2,0 = jumping
        Crafty.sprite(70, 70, 'assets/falcon.gif', {
            falcon_spr: [0, 0]
        });

        Crafty.sprite(44, 'assets/fox.gif', {
            fox_spr: [0, 0]
        });

        // figure out items later
        Crafty.sprite(40, 'assets/hammer.gif', {
            hammer_spr : [0, 0]
        });

        // assets good to go, play the game!
        Crafty.scene('Game');
    }, function (e) {
        // onProgress
        status.text('Loading game assets! ' + e.percent + '%');
    }, function (e) {
        // onError
        console.log(e);
    });
});

// First stage of game
Crafty.scene('Game', function () {
    // Crafty.audio.play('theme');

    Crafty.background('rgb(64, 64, 255');
    var map = Crafty.e("2D, DOM, TiledMapBuilder").setMapDataSource(SRC_FROM_TILED)
        .createWorld();

    var p1 = Crafty.e('Player1, Fox')
        .at(5, 20);

    var p2 = Crafty.e('Player2, CaptainFalcon')
        .at(Game.map_grid.width - 15, 20);

    p2.flip();   // Start facing left

    // put an item in play
    // var hammer = Crafty.e('hammer_spr, item, Actor').at(10, 20);

    // display players' health
    Crafty.e('p1HealthDisplay, 2D, DOM, Text')
        .text('Player 1: ' + p1.health)
        .textColor('#ffffff')
        .attr({
            x: 5,
            y: 5,
            w: 100
        });

    Crafty.e('p2HealthDisplay, 2D, DOM, Text')
        .text('Player 2: ' + p2.health)
        .textColor('#ffffff')
        .attr({
            x: Game.width() - 200,
            y: 5,
            w: 100
        });
});

// Victory screen
Crafty.scene('Victory', function () {
    console.log('victory scene loaded');
    Crafty.background('rgb(255, 255, 0)');
    Crafty.e('2D, DOM, Text')
        .text('You won!!')
        .attr({
            x: Game.width() / 2 - 50,
            y: Game.height() / 2 - 24,
            w: Game.width()
        });
});

// Defeat screen
Crafty.scene('Defeat', function () {
    console.log('Defeat scene loaded');
    Crafty.background('rgb(255, 0, 0)');
    Crafty.e('2D, DOM, Text')
        .text('You lost!!')
        .attr({
            x: Game.width() / 2 - 50,
            y: Game.height() / 2 - 24,
            w: Game.width()
        });
});