/**
 * Dropdown helper class.
 * Helps CSS dropdowns work better by
 * binding click events to elements.
 *
 * @author     Rainner Lins <http://rainnerlins.com/>
 * @copyright  (c) All Rights Reserved
 * @license    See included LICENSE file
 */
(function( name, factory ) {

    if( typeof define === "function" ) { define( factory ); }
    if( typeof exports === "object" ) { module.exports = factory(); }
    if( typeof window === "object" ) { window[ name ] = factory(); }

})( "Dropdown", function() {

    // class constructor
    var Factory = function( dropdown, options )
    {
        this._options = Object.assign( {
            // optional timer to auto hide the dropdown
            autoHideTimeout: 0,
            // ...
        }, options );

        this._dropdown = null;
        this._trigger  = null;
        this._timeout  = null;
        this._visible  = null;
        this._showMenu = this._showMenu.bind( this );
        this._hideMenu = this._hideMenu.bind( this );
        this.select( dropdown );
    };

    // class prototype
    Factory.prototype = {
        constructor: Factory,

        // select dropdown root element/s
        select: function( dropdown )
        {
            dropdown = ( typeof dropdown === "string" ) ? document.querySelector( dropdown ) : dropdown;

            this._dropdown = ( dropdown instanceof Element ) ? dropdown : null;
            this._trigger  = this._dropdown ? this._dropdown.querySelector( ".dropdown-trigger" ) : null;

            if( this._dropdown && this._trigger && !this._dropdown.hasAttribute( "data-dropdown" ) )
            {
                this._dropdown.setAttribute( "data-dropdown", 1 );
                this._dropdown.addEventListener( "mouseup", this._hideMenu );
                this._dropdown.addEventListener( "mouseleave", this._hideMenu );
                this._trigger.addEventListener( "click", this._showMenu );
            }
        },

        // handle dropdown trigger event
        _showMenu: function( e )
        {
            if( this._dropdown && !this._visible )
            {
                this._visible = true;
                this._dropdown.classList.add( "active" );
            }
        },

        // handle dropdown hide event
        _hideMenu: function( e )
        {
            if( this._dropdown && this._visible )
            {
                this._visible = false;
                this._dropdown.classList.remove( "active" );
            }
        },
    };

    // export
    return Factory;
});