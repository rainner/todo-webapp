/**
 * Scroller Class File.
 * Vertical scrolls the page to a position or element.
 *
 * @author     Rainner Lins <http://rainnerlins.com/>
 * @copyright  (c) All Rights Reserved
 * @license    See included LICENSE file
 */
"use strict";

(function( name, factory ) {

    if ( typeof define === "function" ) { define( factory ); } else
    if ( typeof exports === "object" ) { module.exports = factory(); } else
    if ( typeof window === "object" ) { window[ name ] = factory(); }

})( "Scroller", function() {

    // class constructor
    let Factory = function( target, destination, callback ) {
        this._active   = true;
        this._target   = window;
        this._method   = null;
        this._ease     = 10;
        this._min      = 0;
        this._max      = 0;
        this._pos      = 0;
        this._to       = 0;
        this._callback = callback;
        this._loop     = this._loop.bind( this );

        this._parseTarget( target );
        this._parseDestination( destination );
        if ( this._target ) this._loop();
    };

    // class prototype
    Factory.prototype = {
        constructor: Factory,

        // parse target element to be scrolled
        _parseTarget: function( target ) {
            if ( target && typeof target === "string" ) {
                this._target = document.querySelector( target );
            }
            else if ( target && target instanceof Element ) {
                this._target = target;
            }
            if ( this._target ) {
                let scrollHeight = Math.max( 0, Math.floor( this._target.scrollHeight || 0, this._target.clientHeight || 0 ) );
                this._max = Math.floor( scrollHeight - this._target.clientHeight || 0 );
                this._pos = this._target.scrollTop || 0;
            }
        },

        // parse dest position
        _parseDestination: function( dest ) {
            if ( typeof dest === "number" ) {
                this._to = dest;
            }
            else if ( typeof dest === "object" && dest instanceof Element ) {
                this._to = ( this._pos + dest.getBoundingClientRect().top ) || this._pos;
            }
            else if ( typeof dest === "string" ) {
                if ( /^(up|top)$/i.test( dest ) ) { this._to = this._min; } else
                if ( /^(middle|center)$/i.test( dest ) ) { this._to = this._max / 2; } else
                if ( /^(down|bottom)$/i.test( dest ) ) { this._to = this._max; } else
                if ( /^([0-9]+)$/.test( dest ) ) { this._to = parseInt( dest ); }
                else {
                    let node = document.querySelector( dest );
                    this._to = node ? ( this._pos + node.getBoundingClientRect().top ) : this._pos;
                }
            }
            this._to = Math.max( this._min, Math.min( this._to, this._max ) );
        },

        // cleanup after event is done
        _isDone: function() {
            this._active = false;

            if ( typeof this._callback === "function" ) {
                this._callback( this._to );
            }
        },

        // Start scroll animation
        _loop: function() {
            if ( this._active !== true ) return;
            if ( Math.abs( this._to - this._pos ) < 5 ) return this._isDone();

            this._pos += ( this._to - this._pos ) / this._ease;
            this._target.scrollTop = this._pos;

            requestAnimationFrame( this._loop );
        },

    };

    // export
    return Factory;
});
