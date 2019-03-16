/**
 * Sortable Class File.
 * Allows for sorting children of a container using drag/drop.
 *
 * @author     Rainner Lins <http://rainnerlins.com/>
 * @copyright  (c) All Rights Reserved
 * @license    See included LICENSE file
 */
(function( name, factory ) {

    if ( typeof define === "function" ) { define( factory ); } else
    if ( typeof exports === "object" ) { module.exports = factory(); } else
    if ( typeof window === "object" ) { window[ name ] = factory(); }

})( "Sortable", function() {

    // get view and scroll data
    let View = require( "./Viewport" );

    // clamp a value between min and max
    let clamp = function( value, min, max ) {
        return Math.max( min, Math.min( value, max ) );
    };

    // class constructor
    let Factory = function( container, options ) {
        this._options = Object.assign( {
            // only allow dragging if an element with this class was clicked
            handleClass : "sort-handle",
            // class name for the list item that is being moved
            activeClass : "sort-active",
            // class name for the element that is being dragged
            draggerClass : "sort-dragger",
            // drag the sorting item up and down
            moveVertical : true,
            // drag the sorting item left and right
            moveHorizontal : true,
            // sort item attribute that holds a unique ID for serialize
            uniqueAttribute : "id",
            // amount to auto-scroll the page on drag (0: off)
            autoScrollAmount: 20,
            // proximity to window edge to trigger auto scroll (px)
            scrollProximity: 20,
            // ...
        }, options );

        this._container  = null;
        this._listItem   = null;
        this._dragItem   = null;
        this._hovItem    = null;
        this._clickItem  = null;
        this._clickLeft  = 0;
        this._clickTop   = 0;
        this._elements   = [];
        this._order      = "";
        this._dragging   = false;
        this._onChange   = null;
        this._onRelease = this._onRelease.bind( this );
        this._onMove    = this._onMove.bind( this );

        this.setContainer( container );

        window.addEventListener( "mouseup", this._onRelease );
        window.addEventListener( "touchend", this._onRelease );
        window.addEventListener( "mousemove", this._onMove );
        window.addEventListener( "touchmove", this._onMove );
    };

    // class prototype
    Factory.prototype = {
        constructor: Factory,

        // set root sortable container element
        setContainer: function( container ) {
            if ( container instanceof Element && container.hasAttribute( "data-sortable" ) === false ) {
                this._container = container;
                this._container.setAttribute( "data-sortable", 1 );
                this._container.style["position"] = "relative";
            }
        },

        // get root sortable container element
        getContainer: function() {
            return this._container;
        },

        // get attribute value from list container object
        getAttr: function( attr, deft ) {
            if ( this._container && this._container.hasAttribute( attr ) ) {
                return this._container.getAttribute( attr );
            }
            return deft || null;
        },

        // get new order array with unique values from attribute
        getOrder: function( delimiter ) {
            let output = [];

            if ( this._container ) {
                for ( let i = 0; i < this._container.children.length; ++i ) {
                    let item = this._container.children[ i ];
                    let uniq = item.getAttribute( this._options.uniqueAttribute ) || "";
                    if ( uniq ) output.push( uniq );
                }
            }
            if ( delimiter && typeof delimiter === "string" ) {
                return output.join( delimiter );
            }
            return output;
        },

        // get new order array with unique (numeric) values from attribute
        getNumericOrder: function( delimiter ) {
            let output = [];

            this.getOrder().forEach( function( uniq ) {
                let numb = parseInt( uniq.replace( /[^0-9]+/gi, "" ) );
                if ( !isNaN( numb ) ) output.push( numb );
            });
            if ( delimiter && typeof delimiter === "string" ) {
                return output.join( delimiter );
            }
            return output;
        },

        // scan container children and add sortable events to each child element
        scan: function() {
            if ( this._container ) {
                for ( let i = 0; i < this._container.children.length; ++i ) {
                    this.add( this._container.children[ i ] );
                }
            }
        },

        // add sortable events to item element
        add: function( item ) {
            if ( item instanceof Element && !item.hasAttribute( "data-sort-item" ) ) {
                let self = this;
                item.setAttribute( "data-sort-item", 1 );
                item.addEventListener( "mousedown", function( e ){ self._onPress( e, this ); } );
                item.addEventListener( "touchstart", function( e ){ self._onPress( e, this ); } );
                this._elements.push( item );
            }
        },

        // remove sortable events from item element
        remove: function( item ) {
            if ( item instanceof Element && item.hasAttribute( "data-sort-item" ) ) {
                let self = this;
                item.removeAttribute( "data-sort-item" );
                item.removeEventListener( "mousedown", function( e ){ self._onPress( e, this ); } );
                item.removeEventListener( "touchstart", function( e ){ self._onPress( e, this ); } );

                for ( let i = 0; i < this._elements.length; ++i ) {
                    if ( this._elements[ i ] === item ) {
                        this._elements.splice( i, 1 );
                        break;
                    }
                }
            }
        },

        // clear everything
        destroy: function() {
            let self = this;
            window.removeEventListener( "mouseup", this._onRelease );
            window.removeEventListener( "touchend", this._onRelease );
            window.removeEventListener( "mousemove", this._onMove );
            window.removeEventListener( "touchmove", this._onMove );

            for ( let i = 0; i < this._elements.length; ++i ) {
                let item = this._elements[ i ];
                item.removeAttribute( "data-sort-item" );
                item.removeEventListener( "mousedown", function( e ){ self._onPress( e, this ); } );
                item.removeEventListener( "touchstart", function( e ){ self._onPress( e, this ); } );
            }
            if ( this._container ) {
                this._container.removeAttribute( "data-sortable" );
            }
            this._trashDragItem();
            this._container = null;
            this._listItem  = null;
            this._clickItem = null;
            this._hovItem   = null;
            this._dragging  = false;
            this._onChange  = null;
            this._elements  = [];
        },

        // set custom callback to fire when order changes (function)
        onChange: function( callback ) {
            this._onChange = callback;
        },

        // checks if mouse x/y is on top of an item
        _isOnTop: function( item, x, y ) {
            let box = item.getBoundingClientRect(),
                isx = ( x > box.left && x < ( box.left + box.width ) ),
                isy = ( y > box.top && y < ( box.top + box.height ) );
            return ( isx && isy );
        },

        // swap position of two items in sortable list container
        _swapItems: function( item1, item2 ) {
            let parent1 = item1.parentNode,
                parent2 = item2.parentNode;

            if ( parent1 !== parent2 ) // move to new list
            {
                parent2.insertBefore( item1, item2 );
            }
            else {
                let temp = document.createElement( "div" );
                parent1.insertBefore( temp, item1 );
                parent2.insertBefore( item1, item2 );
                parent1.insertBefore( item2, temp );
                parent1.removeChild( temp );
            }
        },

        // finds the offset of el from the body or html element
        _getElementPosition: function( el ) {
            let xPos = 0;
            let yPos = 0;

            while( el ) {
                let xParent = el.offsetParent ? el.offsetParent.offsetLeft : 0;
                let yParent = el.offsetParent ? el.offsetParent.offsetTop : 0;

                xPos += ( el.offsetLeft - el.scrollLeft ) - xParent;
                yPos += ( el.offsetTop - el.scrollTop ) - yParent;

                el = el.offsetParent;
            }
            return { left: xPos, top: yPos };
        },

        // update item position
        _moveItem: function( item, x, y ) {
            let translate = "";

            if ( this._options.moveHorizontal ) {
                translate += "translateX( "+ x +"px ) ";
            }
            if ( this._options.moveVertical ) {
                translate += "translateY( "+ y +"px ) ";
            }
            item.style["-webkit-transform"] = translate;
            item.style["-moz-transform"] = translate;
            item.style["-ms-transform"] = translate;
            item.style["transform"] = translate;
        },

        // make a temp fake item for dragging and add to container
        _makeDragItem: function( item ) {
            let box = this._getElementPosition( item );

            this._dragItem = document.createElement( item.tagName );
            this._dragItem.className = item.className + " " + this._options.draggerClass;
            this._dragItem.innerHTML = item.innerHTML;
            this._dragItem.style["position"] = "absolute";
            this._dragItem.style["z-index"]  = "999";
            this._dragItem.style["margin"]   = "0";
            this._dragItem.style["left"]     = box.left + "px";
            this._dragItem.style["top"]      = box.top + "px";
            this._dragItem.style["width"]    = item.offsetWidth  + "px";
            this._dragItem.style["height"]   = item.offsetHeight + "px";

            if ( /^(TR|TBODY)$/.test( item.tagName ) ) {
                this._dragItem.style["display"] = "table";
                this._dragItem.style["border-collapse"] = "separate";
            }
            if ( this._container ) {
                this._container.appendChild( this._dragItem );
            }
        },

        // remove temp fake item from container and trash it
        _trashDragItem: function() {
            if ( this._container && this._dragItem ) {
                if ( this._container.contains( this._dragItem ) ) {
                    this._container.removeChild( this._dragItem );
                }
            }
            this._dragItem = null;
        },

        // on item press/touch
        _onPress: function( e, item ) {
            if ( e && item ) {
                let handle = this._options.handleClass;
                if ( !handle || !e.target.classList.contains( handle ) ) return;

                e.preventDefault();

                this._dragging   = true;
                this._listItem   = item;
                this._clickItem  = e.target;
                this._clickLeft  = View.mouseLeft( e );
                this._clickTop   = View.mouseTop( e );
                this._order      = this.getOrder( ":" );

                this._makeDragItem( this._listItem );
                this._listItem.classList.add( this._options.activeClass );
                this._onMove( e );
            }
        },

        // on item release/drop
        _onRelease: function( e ) {
            this._trashDragItem();

            if ( this._listItem ) {
                if ( typeof this._onChange === "function" && this.getOrder( ":" ) !== this._order ) {
                    this._onChange.call( this );
                }
                this._listItem.classList.remove( this._options.activeClass );
            }
            this._listItem  = null;
            this._clickItem = null;
            this._hovItem   = null;
            this._dragging  = false;
        },

        // on item drag/move
        _onMove: function( e ) {
            if ( this._dragItem && this._dragging ) {
                let scrollx   = View.scrollLeft(),
                    scrolly   = View.scrollTop(),
                    mousex    = View.mouseLeft( e ),
                    mousey    = View.mouseTop( e ),
                    movex     = ( mousex - this._clickLeft ),
                    movey     = ( mousey - this._clickTop ),
                    posx      = ( mousex - scrollx ),
                    posy      = ( mousey - scrolly );

                this._moveItem( this._dragItem, movex, movey );

                for ( let i = 0; i < this._elements.length; ++i ) {
                    let item = this._elements[ i ];

                    if ( item === this._listItem || item === this._dragItem ) continue;

                    if ( this._isOnTop( item, posx, posy ) ) {
                        this._hovItem = item;
                        this._swapItems( this._listItem, item );
                    }
                }
            }
        },
    };

    // export
    return Factory;
});
