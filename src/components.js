// Holds all of the crafy components.
// This includes the player character(s), items, sprites,
// and other components that make up the environment

/* --- A few essential components from tutorials --- */
// The Grid component allows an element to be located
//  on a grid of tiles

// TODO: 
// Implement items - pick up, display sprites with characters, modify damage, etc
// multiple lives?

Crafty.c('Grid', {
    init: function () {
        this.attr({
            w: Game.map_grid.tile.width,
            h: Game.map_grid.tile.height
        })
    },

    // Locate this entity at the given position on the grid
    at: function (x, y) {
        if (x === undefined && y === undefined) {
            return {
                x: this.x / Game.map_grid.tile.width,
                y: this.y / Game.map_grid.tile.height
            }
        } else {
            this.attr({
                x: x * Game.map_grid.tile.width,
                y: y * Game.map_grid.tile.height
            });
            return this;
        }
    }
});

// An "Actor" is an entity that is drawn in 2D on canvas
//  via our logical coordinate grid
Crafty.c('Actor', {
    init: function () {
        this.requires('2D, Canvas, Grid');
    },
});

// "super class" for each playable character
Crafty.c('Character', {
    init: function () {
        this.requires('Actor, Gravity, SpriteAnimation')
            .gravity('Platform');
    
        this.z = 10;
        // all characters will flip their sprites between moving left and right
        this.bind('NewDirection', function (data) {
            if (data.x > 0)
                this.unflip();
            else if (data.x < 0)
                this.flip();
        });
        // TODO: add things like attacks, damage, lives, etc
        this.health = 100;
    },
    // Stops the movement - same for all characters
    stopMovement: function () {
        this._speed = 0;
        if (this._movement) {
            this.x -= this._movement.x;
            this.y -= this._movement.y;
        }
    }
});

// NOTE: each character must specify the collision component since sprites are not necessarily the same size
Crafty.c('CaptainFalcon', {
    init: function () {
        this.requires('Character, falcon_spr, Collision')
            .animate('standing', 0, 0, 0)
            .animate('punch', 0, 1, 1)
            .animate('running', 0, 2, 5)
            .onHit('Character', function (e) {
                this.stopMovement();
                if (!this.isAttacking && Math.random() < 0.1)
                    this.attackPlayer();
            })
            .bind('EnterFrame', function() {
                this.moveTowardsPlayer();
                // enemy fell of ledge (I don't think this is currently possible
                // unless player falls off first...
                if (this._y > Game.height()) {
                    Crafty.scene('Victory');
                }
            });

        this.bind('HitPlayer2', function (player1) {
            Crafty.audio.play('punch1');
            player1.isAttacking = false;
            // if the enemy is out of health, you win!
            this.health -= 10;
            if (this.health <= 0) {
                console.log('victory!');
                 Crafty.scene('Victory');

            }
            else {
                Crafty('p2HealthDisplay').text('Player 2: ' + this.health);
            }
        });

        this.moveTowardsPlayer = function () {
            var fox = Crafty('Fox');
            if (this._x + this._w < fox._x + 1) {
                if (!this.isPlaying('running') && !this.isPlaying('punch')) {
                    this.stop();
                    this.animate('running', 25, -1);
                }
                // move right - half speed of fox
                this.x += 2;
                this.unflip();
            }
            else if (this._x > fox._x + fox._w - 1) {
                if (!this.isPlaying('running') && !this.isPlaying('punch')) {
                    this.stop();
                    this.animate('running', 25, -1);
                }
                // move left
                this.x -= 2;
                this.flip();
            }
            else if (!this.isPlaying('standing') && !this.isPlaying('punch')) {
                this.animate('standing', 1, 0);
            }
        };

        this.attackPlayer = function () {
            this.isAttacking = true;
            if (!this.isPlaying('punch')) {
                this.animate('punch', 30, 0);
            }
            Crafty.trigger('Player1Hit', this);
            // player must hit enemy within half a second for the hit to register
            var that = this;
            setTimeout(function () {
                that.isAttacking = false;
                if (!that.isPlaying('standing')) {
                    that.animate('standing', 1, 1);
                }
            }, 1000);
        };
    }
});

Crafty.c('Fox', {
    init: function () {
        this.requires('Character, fox_spr, Twoway, Collision')
            .twoway(4, 8)   // run and jump
            .onHit('Character', function () {
                this.stopMovement();
                if (this.isAttacking)
                    Crafty.trigger('HitPlayer2', this); 
            })
            .animate('standing', 0, 2.2 , 0)    // i know floating point tile coords aren't the best
            .animate('running', 0, 0, 3)        // but the sprite sheet is inconsistent, planning to fix.
            .animate('kicking', 5, 2, 5)
            .animate('jumping', 3, 0, 3);
            // Switch animations depending on direction
            this.bind('NewDirection', function (data) {
                if (data.x != 0) {
                    if(!this.isPlaying('running'))
                        this.animate('running', 10, -1);
                }
                else {
                    this.reset();
                    this.stop();
                }
            });
            // not sure if theres a better way to animate jumping
            this.bind('EnterFrame', function () {
                if (this._up) {
                    this.animate('jumping', 1, 1);
                }
                // player fell off map!
                if (this._y > Game.height()) {
                    Crafty.scene('Defeat');
                }
            });
            this.bind('KeyDown', function (data) {
                // spacebar - attack button
                if (data.key === 32) {
                    this.isAttacking = true;
                    this.animate('kicking', 10, 0);
                    // player must hit enemy within half a second for the hit to register
                    var that = this;
                    setTimeout(function () {
                        that.isAttacking = false;
                        that.animate('standing', 1, 0);
                    }, 500);
                }
            });
            this.bind('Player1Hit', function (player2) {
                Crafty.audio.play('punch2');
                this.health -= 10;
                if (this.health <= 0) {
                    console.log('defeat!');
                    Crafty.scene('Defeat');

                }
                else {
                    Crafty('p1HealthDisplay').text('Player 1: ' + this.health);
                }
            });
        
            this.isAttacking = false;
    }
});

// Initialize all parts of map that can't be interacted with
// To a z-index of 0.
Crafty.c('Scenery', {
    init: function () {
        this.requires('2D, Canvas');
        this.z = 0;
    }
});
