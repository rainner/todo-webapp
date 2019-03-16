/**
 * Utils File.
 *
 * @author     Rainner Lins <http://rainnerlins.com/>
 * @copyright  (c) All Rights Reserved
 * @license    See included LICENSE file
 */
(function( name, factory ) {

    if ( typeof define === "function" ) { define( factory ); }
    if ( typeof exports === "object" ) { module.exports = factory(); }
    if ( typeof window === "object" ) { window[ name ] = factory(); }

})( "Utils", function() {

    // check once if css transform is supported
    let hasTransform = (function() {
        let props = "transform WebkitTransform MozTransform OTransform msTransform".split( " " );
        let div = document.createElement( "div" );

        for ( let i = 0, t = props.length; i < t; ++i ) {
            if ( div.style[ props[ i ] ] !== undefined ) return true;
        }
        return false;
    })();

    // utils
    return {

        // checks for mobile device
        isMobile: function() {
            let ua = ( navigator.userAgent || navigator.vendor || window.opera || "" );
            return /Mobi/.test( ua );
        },

        // random float value from argument range
        randFloat: function() {
            if ( arguments.length === 1 ) // only 1 argument
            {
                if ( Array.isArray( arguments[0] ) ) // extract index from array
                {
                    let index = Math.round( random( 0, arguments[0].length - 1 ) );
                    return arguments[0][ index ];
                }
                return random( 0, arguments[0] ); // assume numeric
            }
            else if ( arguments.length === 2 ) // two arguments range
            {
                return Math.random() * ( arguments[1] - arguments[0] ) + arguments[0];
            }
            return 0; // default
        },

        // random rounded value from argument range
        randInt: function() {
            return Math.round( this.randFloat.apply( this, arguments ) );
        },

        // get a or b by random chance
        randFlip: function( a, b ) {
            let int = this.randInt( 1, 2 );
            return ( int === 2 ) ? a : b;
        },

        // get current date string
        dateString: function() {
            let date    = new Date(),
                year    = date.getUTCFullYear(),
                month   = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][ date.getMonth() ],
                day     = date.getUTCDate(),
                minute  = date.getMinutes(),
                fullh   = date.getHours(),
                hour    = ( fullh > 12 ) ? ( fullh - 12 ) : fullh,
                ampm    = ( fullh > 12 ) ? "PM" : "AM",
                _p      = function( n ) { return ( n < 10 ) ? "0"+ n : ""+ n; };

            hour = ( hour === 0 ) ? 12 : hour;
            return month + "/" + _p( day ) + "/" + year + " " + _p( hour ) + ":" + _p( minute ) + " " + ampm;
        },

        // random string for a given length
        randString: function( len ) {
            let chars  = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
                length = parseInt( len ) || 10,
                output = "";

            while( length ) {
                output += chars.charAt( Math.floor( Math.random() * chars.length ) );
                length--;
            }
            return output;
        },

        // get a unique ID string that uses the current timestamp and a random value
        idString: function() {
            return ( Date.now().toString( 36 ) + Math.random().toString( 36 ).substr( 2, 5 ) ).toUpperCase();
        },

        // cap a number between min and max values
        capRange: function( num, min, max ) {
            return Math.max( min, Math.min( num, max ) );
        },

        // map number between input and output ranges
        mapRange: function( current, capMin, capMax, outMin, outMax ) {
            let output = (current - capMin) / (capMax - capMin) * (outMax - outMin) + outMin;
            return isNaN( output ) ? current : output;
        },

        // get x/y position to place an object in center of a container
        centerPosition : function( parentWidth, parentHeight, objectWidth, objectHeight ) {
            return {
                left : ( parentWidth - objectWidth ) / 2,
                top  : ( parentHeight - objectHeight ) / 2,
            };
        },

        // loop through a list of objects to see if one has the value for prop given
        arrayObjectExists: function( list, prop, value, retrn ) {
            if ( Array.isArray( list ) && prop && typeof prop === "string" && value !== undefined ) {
                for ( let i = 0; i < list.length; ++i ) {
                    let obj = list[ i ];

                    if ( typeof obj === "object" && obj.hasOwnProperty( prop ) && obj[ prop ] === value ) {
                        return ( retrn ) ? obj : true;
                    }
                }
            }
            return false;
        },

        // loop through a list of objects to see if one has the value for prop given and return it
        getArrayObject: function( list, prop, value ) {
            let obj = this.arrayObjectExists( list, prop, value, true );
            return obj || {};
        },

        // convert an object to an enumerated array
        objectToArray: function( obj ) {
            let output = [];

            if ( typeof obj === "object" || Array.isArray( obj ) ) {
                let keys = Object.keys( obj );

                for ( let i = 0; i < keys.length; ++i ) {
                    output.push( obj[ keys[ i ] ] );
                }
            }
            return output;
        },

        // get the value of a css property for an element
        cssValue: function( element, prop, deft ) {
            if ( element && element instanceof Element && prop && typeof prop === "string" ) {
                return window.getComputedStyle( element, null ).getPropertyValue( prop ) || deft;
            }
            return deft;
        },

        // add vendor prefixes to property keys
        cssPrefix: function( props ) {
            let output = {};

            if ( typeof props === "object" ) {
                let v = ["-webkit-", "-moz-", "-ms-", "-o-", ""];

                for ( let key in props ) {
                    if ( props.hasOwnProperty( key ) ) {
                        for ( let i = 0, t = v.length; i < t; ++i ) {
                            output[ v[ i ] + key ] = props[ key ];
                        }
                    }
                }
            }
            return output;
        },

        // remove all children from a root element
        emptyElement: function( element ) {
            if ( element instanceof Element ) {
                while( element.firstChild ) {
                    element.removeChild( element.firstChild );
                }
            }
        },

        // create a new dom element
        createElement: function( tag, styles ) {
            let tagname = ( typeof tag === "string" ) ? tag : "div",
                element = document.createElement( tagname );

            if ( typeof styles === "object" ) {
                for ( let key in styles ) {
                    if ( styles.hasOwnProperty( key ) ) {
                        element.style[ key ] = styles[ key ];
                    }
                }
            }
            return element;
        },

        // apply prefixed css transform rules to an element
        transformElement: function( element, options ) {
            if ( element && typeof options === "object" ) {
                let transforms = "";

                // apply element opacity
                if ( options.hasOwnProperty( "opacity" ) ) {
                    let opacity = parseFloat( options.opacity );
                    opacity = ( opacity > 1 ) ? 1 : opacity;
                    opacity = ( opacity < 0 ) ? 0 : opacity;
                    element.style["opacity"] = opacity;
                }
                // add translate values
                if ( options.hasOwnProperty( "x" ) || options.hasOwnProperty( "y" ) ) {
                    let x = parseFloat( options.x || 0 ),
                        y = parseFloat( options.y || 0 ),
                        z = parseFloat( options.z || 0 );

                    if ( hasTransform ) {
                        transforms += "translateX( "+ x +"px ) ";
                        transforms += "translateY( "+ y +"px ) ";
                    } else {
                        element.style["left"] = x +"px";
                        element.style["top"] = y +"px";
                    }
                }
                // ad rotation value
                if ( options.hasOwnProperty( "rotate" ) ) {
                    transforms += "rotate( "+ parseFloat( options.rotate ) +"deg ) ";
                }
                // add scale value
                if ( options.hasOwnProperty( "scale" ) ) {
                    let scale = parseFloat( options.scale );
                    scale = ( scale < 0 ) ? 0 : scale;
                    transforms += "scale( "+ scale +" ) ";
                }
                // apply transforms with vendor prefix
                if ( transforms ) {
                    element.style["-webkit-transform"] = transforms;
                    element.style["-moz-transform"] = transforms;
                    element.style["-ms-transform"] = transforms;
                    element.style["-o-transform"] = transforms;
                    element.style["transform"] = transforms;
                }
            }
        },

    };
});
