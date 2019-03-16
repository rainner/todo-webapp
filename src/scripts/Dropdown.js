/**
 * Dropdown helper class.
 *
 * @author     Rainner Lins <http://rainnerlins.com/>
 * @copyright  (c) All Rights Reserved
 * @license    See included LICENSE file
 */
(function( name, factory ) {

    if ( typeof define === "function" ) { define( factory ); }
    if ( typeof exports === "object" ) { module.exports = factory(); }
    if ( typeof window === "object" ) { window[ name ] = factory(); }

})( "Dropdown", function() {

    // class constructor
    let Factory = function( dropdown, options ) {
        this._options = Object.assign( {
            // ...
        }, options );

        this._visible    = false;
        this._dropdown   = null;
        this._trigger    = null;
        this._list       = null;
        this._listClass  = "";
        this._showMenu   = this._showMenu.bind( this );
        this._hideMenu   = this._hideMenu.bind( this );
        this._toggleMenu = this._toggleMenu.bind( this );

        this.select( dropdown );
        document.body.addEventListener( "click", this._hideMenu );
    };

    // class prototype
    Factory.prototype = {
        constructor: Factory,

        // select dropdown root element/s
        select: function( dropdown ) {
            dropdown = ( typeof dropdown === "string" ) ? document.querySelector( dropdown ) : dropdown;

            this._dropdown = ( dropdown instanceof Element ) ? dropdown : null;
            this._trigger  = this._dropdown ? this._dropdown.querySelector( ".dropdown-trigger" ) : null;
            this._list     = this._dropdown ? this._dropdown.querySelector( "ul" ) : null;

            if ( this._dropdown && this._trigger && this._list && !this._dropdown.hasAttribute( "data-dropdown" ) ) {
                this._listClass = this._list.className;
                this._dropdown.setAttribute( "data-dropdown", 1 );
                this._dropdown.addEventListener( "click", e => e.stopPropagation() );
                this._dropdown.addEventListener( "mouseleave", this._hideMenu );
                this._trigger.addEventListener( "click", this._toggleMenu );
            }
        },

        // modify list class to account for going off the screen
        _adjustList: function() {
            if ( this._list ) {
                let box        = this._list.getBoundingClientRect(),
                    boxWidth   = this._list.offsetWidth,
                    boxHeight  = this._list.offsetHeight,
                    pageLeft   = 0,
                    pageTop    = 0,
                    pageRight  = window.innerWidth,
                    pageBottom = window.innerHeight;

                if ( box.top < pageTop ) // move down
                {
                    this._list.classList.remove( "dropdown-top" );
                    this._list.classList.add( "dropdown-bottom" );
                }
                if ( ( box.top + boxHeight ) > pageBottom ) // move up
                {
                    this._list.classList.remove( "dropdown-bottom" );
                    this._list.classList.add( "dropdown-top" );
                }
                if ( box.left < pageLeft ) // move right
                {
                    this._list.classList.remove( "dropdown-left" );
                    this._list.classList.add( "dropdown-right" );
                }
                if ( ( box.left + boxWidth ) > pageRight ) // move left
                {
                    this._list.classList.remove( "dropdown-right" );
                    this._list.classList.add( "dropdown-left" );
                }
            }
        },

        // set dropdown to active
        _showMenu: function( e ) {
            if ( this._dropdown && !this._visible ) {
                this._visible = true;
                this._dropdown.classList.add( "active" );
                setTimeout( this._adjustList.bind( this ), 100 );
            }
        },

        // set dropdown to inactive (hide)
        _hideMenu: function( e ) {
            if ( this._dropdown && this._visible ) {
                this._visible = false;
                this._dropdown.classList.remove( "active" );
                this._list.className = this._listClass;
            }
        },

        // toggle dropdown state
        _toggleMenu: function( e ) {
            e.preventDefault();
            if ( this._visible ) { this._hideMenu( e ); }
            else { this._showMenu( e ); }
        },
    };

    // export
    return Factory;
});
