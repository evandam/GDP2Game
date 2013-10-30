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
        this.requires('Character, falcon_spr, Collision, Twoway')
            // .twoway(4, 8)  // move and jump
            .animate('standing', 0, 0, 0)
            .animate('jumping', 0, 0, 2)
            .animate('running', 0, 6, 6)
            .onHit('Character', function (e) {
                this.stopMovement();
            });

        // Switch animations depending on direction
        this.bind('NewDirection', function (data) {
            // it seems like this logic would animate the player jumping/landing...but work on this later
            if (data.x != 0) {
                this.animate('running', 4, -1);
            }
            else if (data.y > 0) {
                this.animate('jumping', 0, 0);
            }
            else {
                this.animate('standing', 0, 0);
            }
        });

        this.bind('HitPlayer2', function (player1) {
            // this should check if an attack is currently being performed  
            player1.isAttacking = false;
            Crafty.audio.play('punch1');            
            // if the enemy is out of health, you win!
            this.health -= 10;
            if (this.health <= 0) {
                console.log('victory!');
                try {
                    Crafty.scene('Victory');
                } catch (e) {
                    console.log(e);
                }
            }
            else {
                Crafty('p2HealthDisplay').text('Player 2: ' + this.health);
            }
        });
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
            .animate('standing', 0, 1.95, 0)    // i know floating point tile coords aren't the best
            .animate('running', 0, 0, 3)        // but the sprite sheet is inconsistent, planning to fix.
            .animate('kicking', 5, 1.6, 5)
            .animate('jumping', 3, 0, 3);
            // Switch animations depending on direction
            this.bind('NewDirection', function (data) {
                if (data.x != 0) {
                    this.animate('running', 10, -1);
                }
                else {
                    this.reset();
                    this.stop();
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
                // W - jump - play an animation for 1 second
                else if (data.key === 87) {
                    this.animate('jumping', 1, 0);
                    var that = this;
                    setTimeout(function () {
                        that.animate('standing', 1, 0);
                    }, 1000);
                }
                // disable arrow keys
                else if (data.key >= 37 && data.key <= 40) {
                    // do nothing! how to stop propagation?
                    return false;
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
