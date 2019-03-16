/**
 * Viewport Class File.
 * Helper object for working with viewport data.
 *
 * @author     Rainner Lins <http://rainnerlins.com/>
 * @copyright  (c) All Rights Reserved
 * @license    See included LICENSE file
 */
(function( name, factory ) {

    if ( typeof define === "function" ) { define( factory ); } else
    if ( typeof exports === "object" ) { module.exports = factory(); } else
    if ( typeof window === "object" ) { window[ name ] = factory(); }

})( "Viewport", function() {

    let _w = window,
        _s = window.screen,
        _d = document.documentElement,
        _b = document.body;

    return {
        screenWidth : function() {
            return Math.max( 0, _s.width || _s.availWidth || 0 );
        },
        screenHeight : function() {
            return Math.max( 0, _s.height || _s.availHeight || 0 );
        },
        clientWidth : function() {
            return Math.max( 0, _w.innerWidth || _d.clientWidth || _b.clientWidth || 0 );
        },
        clientHeight : function() {
            return Math.max( 0, _w.innerHeight || _d.clientHeight || _b.clientHeight || 0 );
        },
        pageWidth : function() {
            return Math.max( 0, _b.scrollWidth || 0, _b.offsetWidth || 0, _d.clientWidth || 0, _d.offsetWidth || 0, _d.scrollWidth || 0 );
        },
        pageHeight : function() {
            return Math.max( 0, _b.scrollHeight || 0, _b.offsetHeight || 0, _d.clientHeight || 0, _d.offsetHeight || 0, _d.scrollHeight || 0 );
        },
        pageLeft : function() {
            return Math.max( 0, _d.clientLeft || _b.clientLeft || 0 );
        },
        pageTop : function() {
            return Math.max( 0, _d.clientTop || _b.clientTop || 0 );
        },
        scrollLeft : function() {
            return Math.max( 0, _w.pageXOffset || _d.scrollLeft || _b.scrollLeft || 0 ) - this.pageLeft();
        },
        scrollTop : function() {
            return Math.max( 0, _w.pageYOffset || _d.scrollTop || _b.scrollTop || 0 ) - this.pageTop();
        },
        scrollRight : function() { // max right
            return Math.max( 0, Math.floor( this.pageWidth() - this.clientWidth() ) );
        },
        scrollBottom : function() { // max bottom
            return Math.max( 0, Math.floor( this.pageHeight() - this.clientHeight() ) );
        },
        mouseLeft : function( e ) {
            let t = ( e && e.changedTouches ) ? e.changedTouches[ 0 ] : {};
            return e ? Math.max( 0, t.pageX || e.pageX || e.clientX || 0 ) : 0;
        },
        mouseTop : function( e ) {
            let t = ( e && e.changedTouches ) ? e.changedTouches[ 0 ] : {};
            return e ? Math.max( 0, t.pageY || e.pageY || e.clientY || 0 ) : 0;
        },
        centerX : function( e ) { // pointer axis from center
            return ( this.mouseLeft( e ) - ( this.clientWidth() / 2 ) );
        },
        centerY : function( e ) { // pointer axis from center
            return ( this.mouseTop( e ) - ( this.clientHeight() / 2 ) );
        },
        elementWidth : function( e ) { // border-box
            return e ? Math.max( 0, e.offsetWidth || 0 ) : 0;
        },
        elementHeight : function( e ) { // border-box
            return e ? Math.max( 0, e.offsetHeight || 0 ) : 0;
        },
        elementLeft : function( e ) { // from window
            return e ? e.getBoundingClientRect().left : 0;
        },
        elementTop : function( e ) { // from window
            return e ? e.getBoundingClientRect().top : 0;
        },
        clampValue : function( value, min, max ) {
            return Math.max( min, Math.min( value, max ) );
        }
    };
});
