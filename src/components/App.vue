<template>
    <!-- app main wrapper -->
    <div class="app-wrap">
        <!-- main todo area -->
        <div class="app-left">
            <tasklist :todos="todos"></tasklist>
        </div>
        <!-- right sidebar -->
        <div class="app-right">
            <savedlists :lists="lists"></savedlists>
        </div>
    </div>
</template>

<script>
// imports
import TaskList from "./TaskList.vue";
import SavedLists from "./SavedLists.vue";
import Notify from "../scripts/Notify";
import Prompt from "../scripts/Prompt";
import Tooltip from "../scripts/Tooltip";

// setup global handlers
var notify = new Notify();
var tooltip = new Tooltip();

// app root component
export default {

    // component name
    name: "app",

    // sub components
    components: {
        "tasklist": TaskList,
        "savedlists": SavedLists,
    },

    // app data
    data() {
        return {
            key: "todo_app_data",
            lists: [],
            todos: {},
            index: -1,
        }
    },

    // app methods
    methods: {

        // check if sidebar is is current selected list
        isActiveList: function( index )
        {
            return ( index === this.index ) ? true : false;
        },

        // select a todos list to be active from sidebar
        selectTodos: function( index )
        {
            if( this.lists[ index ] !== undefined )
            {
                this.index = index;
                this.todos = this.lists[ index ];
                this.todos.index = index;
            }
        },

        // clear current selected todos list
        unselectTodos: function()
        {
            this.index = -1;
            this.todos = {};
        },

        // add new todos-list to the list and select it
        createTodos: function( name )
        {
            var todos = {
                index    : 0,
                id       : this.getRandomString(),
                name     : name || "Todos " + this.getDateString(),
                modified : this.getDateString(),
                entries  : [],
            };
            this.lists.push( todos );
            this.selectTodos( this.lists.length - 1 );

            if( this.saveData() )
            {
                this.showNotice( "success", "New todos list created." );
            }
        },

        // update current selected todos-list data
        updateTodos: function( todos )
        {
            if( todos && typeof todos === "object" && this.index >= 0 )
            {
                this.todos = todos;
                this.todos.index = this.index;
                this.todos.modified = this.getDateString();
                this.lists[ this.index ] = todos;

                if( this.saveData() )
                {
                    this.showNotice( "success", "Todos list has been updated." );
                }
            }
        },

        // delete selected todos-list from the list
        deleteTodos: function()
        {
            if( this.index >= 0 )
            {
                var self = this;

                new Prompt({
                    title: "Confirm...",
                    confirm: "Delete this list?",
                    onAccept: function()
                    {
                        self.lists.splice( self.index, 1 );
                        self.unselectTodos();

                        if( self.saveData() )
                        {
                            self.showNotice( "success", "Todos list has been deleted." );
                        }
                    }
                });
            }
        },

        // get current date string
        getDateString: function()
        {
            var date    = new Date(),
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

        // get a random string
        getRandomString: function( length )
        {
            var chars  = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
                length = length || 10,
                output = "";

            while( length )
            {
                output += chars.charAt( Math.floor( Math.random() * chars.length ) );
                length--;
            }
            return output;
        },

        // add element to tooltip's list
        addTooltip: function( el )
        {
            tooltip.select( el );
        },

        // add element to tooltip's list
        removeTooltip: function( el )
        {
            tooltip.unselect( el );
        },

        // show page notice
        showNotice: function( type, info, time )
        {
            notify.add( type, info, time );
        },

        // load saved data from store
        loadData: function()
        {
            try {
                var json = localStorage.getItem( this.key ) || "[]";
                var data = JSON.parse( json );
                this.lists = data || [];
                return true;
            }
            catch( e ) { console.log( e ); }
            return false;
        },

        // save local data to store
        saveData: function()
        {
            try {
                var json = JSON.stringify( this.lists );
                localStorage.setItem( this.key, json );
                return true;
            }
            catch( e ) {
                notify.error( "Could not save app data." );
                console.log( e );
            }
            return false;
        },
    },

    // before component mounted
    beforeMount: function()
    {
        this.loadData();
    },

    // component mounted
    mounted: function()
    {
        if( this.lists.length )
        {
            this.selectTodos( 0 );
        }
    },
}
</script>

<style lang="scss">
@charset "utf-8";
@import "../scss/variables";
@import "../scss/reset";
@import "../scss/modifiers";
@import "../scss/fontello";
@import "../scss/type";
@import "../scss/buttons";
@import "../scss/links";
@import "../scss/flexbox";
@import "../scss/forms";
@import "../scss/shadows";
@import "../scss/utils";
@import "../scss/notify";
@import "../scss/prompt";
@import "../scss/tooltip";
@import "../scss/app";
</style>