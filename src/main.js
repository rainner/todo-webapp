/**
 * App entry file
 */
import {} from "./scripts/Polyfill";
import Vue from "vue";
import App from "./components/App.vue";
import Dropdown from "./scripts/Dropdown";
import Tooltip from "./scripts/Tooltip";

const tooltip = new Tooltip();

Vue.directive( "tooltip", {
    bind: function( el ) { tooltip.select( el ); },
    unbind: function( el ) { tooltip.unselect( el ); },
});

Vue.directive( "dropdown", {
    bind: function( el ) { new Dropdown( el ); },
});

new Vue({
    el: "#app",
    render: h => h( App )
});
