/**
 * Notify Class File.
 * Adds notifications to a fixed container on the page.
 *
 * @author     Rainner Lins <http://rainnerlins.com/>
 * @copyright  (c) All Rights Reserved
 * @license    See included LICENSE file
 */
(function( name, factory ) {

    if ( typeof define === "function" ) { define( factory ); } else
    if ( typeof exports === "object" ) { module.exports = factory(); } else
    if ( typeof window === "object" ) { window[ name ] = factory(); }

})( "Notify", function() {

    // class constructor
    let Factory = function( options ) {
        this._options = Object.assign( {
            // main container class
            containerClass: "notify-wrap",
            // class used to animate notice in/out
            toggleClass: "notify-visible",
            // delay for removing notice from DOM to allow for css animation to complete (ms)
            toggleDuration: 600,
            // z-index level for container
            zIndex: 9999,
            // ...
        }, options );

        this._container = document.createElement( "div" );
        this._container.className = this._options.containerClass;
        this._sendToBack();

        document.body.appendChild( this._container );
    };

    // class prototype
    Factory.prototype = {
        constructor: Factory,

        // Add a success notice
        success: function( message, timeout ) {
            this.add( "success", message, timeout );
        },

        // Add a warning notice
        warn: function( message, timeout ) {
            this.add( "warning", message, timeout );
        },

        // Add a info notice
        info: function( message, timeout ) {
            this.add( "info", message, timeout );
        },

        // Add a error notice
        error: function( message, timeout ) {
            this.add( "danger", message, timeout );
        },

        // Add new notice to container
        add: function( type, message, timeout ) {
            type    = String( type || "info" );
            message = String( message || "No message" );
            timeout = parseInt( timeout || 3000 );

            let notice = document.createElement( "div" );
            notice.className = "notify-item notify-"+ type;
            notice.innerHTML = '<div class="notify-message">'+ message +'</div>';

            let remove = function() { this._removeNotice( notice ); };

            if ( timeout ) notice._sto = setTimeout( remove.bind( this ), timeout );
            notice.addEventListener( "click", remove.bind( this ), true );

            this._bringToFront();
            this._insertNotice( notice );
        },

        // Add notice to the top of the list insise the container
        _insertNotice: function( notice ) {
            this._container.appendChild( notice );
            let show = function(){ notice.classList.add( this._options.toggleClass ); };
            setTimeout( show.bind( this ), 60 );
        },

        // Remove notice from container
        _removeNotice: function( notice ) {
            let remove = function() {
                if ( this._container.contains( notice ) ) {
                    this._container.removeChild( notice );
                }
                if ( this._container.hasChildNodes() !== true ) {
                    this._sendToBack();
                }
            };
            if ( notice._sto ) {
                clearTimeout( notice._sto );
                notice._sto = null;
            }
            notice.classList.remove( this._options.toggleClass );
            setTimeout( remove.bind( this ), this._options.toggleDuration );
        },

        // Setup the event and/or timeout to hide an notice
        _setupNoticeEvents: function( notice, timeout ) {
            if ( notice instanceof Element ) {
                let remove = function() {
                    if ( this._timeout ) clearTimeout( this._timeout );
                    this._removeNotice( notice );
                    this._timeout = null;
                };
                if ( timeout ) {
                    this._timeout = setTimeout( remove.bind( this ), timeout );
                }
                notice.addEventListener( "click", remove.bind( this ), true );
            }
        },

        // bring loader container to front
        _bringToFront: function() {
            this._container.style["z-index"] = this._options.zIndex;
        },

        // send container to back
        _sendToBack: function() {
            this._container.style["z-index"] = ( this._options.zIndex * -1 );
        },

    };

    // export
    return Factory;
});
