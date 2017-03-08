<template>
    <!-- app main wrapper -->
    <div class="app-wrap">

        <!-- fixed header -->
        <header class="header-wrap">
            <nav class="header-nav">
                <div class="header-icon">
                    <button class="icon-tasks text-secondary-hover" title="App home" @click="unselectTodos()" v-tooltip></button>
                </div>
                <div class="header-input">
                    <input type="text" name="listName" placeholder="New todos list name..." autocomplete="off" v-model="todos.name" @focus="onFocus( $event )" @keyup.enter="todoListSave( $event, 1 )" @blur="todoListSave( $event )" />
                </div>
                <div class="header-btn">
                    <button class="icon-plus text-success-hover" title="New list" @click="createTodos()" v-tooltip></button>
                </div>
                <div class="header-btn" id="sidebar-toggle-btn">
                    <button class="icon-book text-grey-hover" title="Saved lists" @click="showSidebar( $event )" v-tooltip></button>
                </div>
                <div class="header-btn dropdown" v-dropdown>
                    <button class="icon-menu text-grey-hover dropdown-trigger"></button>
                    <ul class="dropdown-tr">
                        <li><a href="#" class="icon-home" @click.prevent="unselectTodos()"> App home</a></li>
                        <li><a href="#" class="icon-reload" @click.prevent="reloadPage()"> Reload app</a></li>
                        <li v-if="hasActiveTodos()"><a href="#" class="icon-check text-success-hover" @click.prevent="todoListToggle( $event, true )"> Check all tasks</a></li>
                        <li v-if="hasActiveTodos()"><a href="#" class="icon-clock text-warning-hover" @click.prevent="todoListToggle( $event, false )"> Uncheck all tasks</a></li>
                        <li v-if="hasActiveTodos()"><a href="#" class="icon-reload text-danger-hover" @click.prevent="emptyTodos( $event )"> Empty tasks list</a></li>
                        <li v-if="hasActiveTodos()"><a href="#" class="icon-x text-danger-hover" @click.prevent="deleteTodos( $event )"> Delete tasks list</a></li>
                        <li><a href="#" class="icon-tool" @click.prevent="showOptions()"> Options</a></li>
                    </ul>
                </div>
            </nav>
        </header>

        <!-- app columns container -->
        <main class="app-columns">
            <div class="app-left" @mouseup="hideSidebar( $event )">
                <component :is="comp" :lists="lists" :todos="todos" :options="options"></component>
            </div>
            <div class="app-right" @mouseleave="hideSidebar( $event )" @blur="hideSidebar( $event )">
                <savedlists :lists="lists" :todos="todos" :options="options"></savedlists>
            </div>
        </main>

    </div>
</template>


<script>
// dependencies
import Welcome from "./Welcome.vue";
import NotFound from "./NotFound.vue";
import TaskList from "./TaskList.vue";
import SavedLists from "./SavedLists.vue";
import Options from "./Options.vue";
import Dropdown from "../scripts/Dropdown";
import Notify from "../scripts/Notify";
import Prompt from "../scripts/Prompt";
import Tooltip from "../scripts/Tooltip";

// setup global handlers
var notify = new Notify();
var tooltip = new Tooltip();

// component
export default {

    // component name
    name: "app",

    // sub components
    components: {
        "welcome": Welcome,
        "notfound": NotFound,
        "tasklist": TaskList,
        "savedlists": SavedLists,
        "options": Options,
    },

    // component data
    data() {
        return {
            index   : -1,   // index of current selected todos list
            path    : "",   // keep track of url hash/path for app state
            comp    : "",   // current component selected to show
            last    : "",   // last string captured from a input focus event
            lists   : [],   // all saved todos lists
            todos   : {},   // current active todos list data
            options : {},   // app options saved/loaded from localStorage
            keys    : {     // keys used for app data/options store
                lists   : "todo_app_data",
                options : "todo_app_options",
            },
        }
    },

    // custom dom element manipulations
    directives: {

        // apply dropdown menu
        dropdown: {
            bind: function( el, binding, vnode ) {
                new Dropdown( el );
            },
        },

        // apply tooltip text
        tooltip: {
            bind: function( el, binding, vnode ) {
                tooltip.select( el );
            },
            unbind: function( el, binding, vnode ) {
                tooltip.unselect( el );
            },
        },
    },

    // component methods
    methods: {

        // set new component view and location hash
        setComponent: function( comp, path )
        {
            if( comp && typeof comp === "string" )
            {
                this.comp = comp;
            }
            if( path && typeof path === "string" )
            {
                window.location.hash = path;
            }
            return comp;
        },

        // reload the page
        reloadPage: function()
        {
            top.location.reload();
        },

        // capture previous value of something to compare later when saving
        onFocus: function( e )
        {
            if( e && e.target )
            {
                this.last = e.target.value || "";
            }
        },

        // check if sidebar is is current selected list
        isActiveList: function( index )
        {
            return ( index === this.index ) ? true : false;
        },

        // select a todos list to be active from sidebar
        selectTodos: function( lookup )
        {
            var index = 0;

            if( typeof lookup === "string" && /^([0-9]+)$/.test( lookup ) )
            {
                index = parseInt( lookup );
            }
            else if( typeof lookup === "number" )
            {
                index = lookup;
            }
            if( this.lists[ index ] !== undefined )
            {
                this.index = index;
                this.todos = this.lists[ index ];
                this.todos.index = index;
                return this.setComponent( "tasklist", "/list/" + index );
            }
            return this.setComponent( "notfound" );
        },

        // clear current selected todos list
        unselectTodos: function()
        {
            this.index = -1;
            this.todos = {};
            return this.setComponent( "welcome", "/home" );
        },

        // show app options component
        showOptions: function()
        {
            this.index = -1;
            this.todos = {};
            return this.setComponent( "options", "/options" );
        },

        // check if there is an active todos present
        hasActiveTodos: function()
        {
            if( !this.todos ) return false;
            if( !this.todos.name ) return false;
            if( !this.todos.hasOwnProperty( "entries" ) ) return false;
            return true;
        },

        // check if current todos has entries
        hasTodosEntries: function()
        {
            return ( this.hasActiveTodos() && this.todos.entries.length ) ? true : false;
        },

        // add new todos-list to the list and select it
        createTodos: function( name )
        {
            var todos = {
                index    : 0,
                id       : this.getRandomString( 10 ),
                name     : name || this.getDateString(),
                modified : this.getDateString(),
                time     : Date.now(),
                entries  : [],
            };
            this.lists.splice( 0, 0, todos );
            this.selectTodos( 0 );
            this.saveData( "New todos list has been created." );
        },

        // update current selected todos-list name
        updateTodos: function( name )
        {
           if( name && typeof name === "string" && this.hasActiveTodos() )
            {
                this.todos.name = name;
                this.todos.modified = this.getDateString();
                this.saveData( "Todos list name has been changed." );
            }
        },

        // empty current todos list
        emptyTodos: function()
        {
            if( this.hasActiveTodos() )
            {
                var self = this;

                new Prompt({
                    title: "Confirm...",
                    confirm: "Remove all tasks from this list?",
                    onAccept: function()
                    {
                        self.todos.entries = [];
                        self.saveData( "Todos list has been flushed." );
                    }
                });
            }
        },

        // delete selected todos-list from the list
        deleteTodos: function()
        {
            if( this.hasActiveTodos() )
            {
                var self = this;

                new Prompt({
                    title: "Confirm...",
                    confirm: "Delete this list?",
                    onAccept: function()
                    {
                        self.lists.splice( self.index, 1 );
                        self.unselectTodos();
                        self.saveData( "Todos list has been deleted." );
                    }
                });
            }
        },

        // save new order of todo tasks for active todos
        sortTodos: function( indexes )
        {
            // do we have an active todos list and a new list of indexes?...
            if( indexes && Array.isArray( indexes ) && this.hasActiveTodos() )
            {
                // is the length of new indexes same as active list todos?...
                if( indexes.length === this.todos.entries.length )
                {
                    // copy originals as is
                    var lists   = this.lists.slice( 0 );
                    var todos   = Object.assign( {}, this.todos );
                    var entries = [];

                    // loop new list of indexes...
                    for( var i = 0; i < indexes.length; ++i )
                    {
                        // place tasks in the right spot based on sorted index list
                        entries[ i ] = todos.entries[ indexes[ i ] ];
                    }
                    // build new data to be saved separate from current Vue data
                    todos.entries = entries;
                    todos.modified = this.getDateString();
                    lists[ this.index ] = todos;
                    this.saveData( "New todos list order has been saved.", lists );
                }
            }
        },

        // check/uncheck all tasks in active list
        todoListToggle: function( e, status )
        {
            if( e && typeof status === "boolean" )
            {
                var msg = status ? "checked" : "unchecked";

                if( this.hasTodosEntries() )
                {
                    for( var i = 0; i < this.todos.entries.length; ++i )
                    {
                        this.todos.entries[ i ].complete = status;
                        this.todos.entries[ i ].modified = this.getDateString();
                    }
                    this.saveData( "All list tasks have been " + msg + "." );
                }
            }
        },

        // catch input event to change list name
        todoListSave: function( e, enter )
        {
            var name = e.target.value || "";

            // when calling this from both an enter and blur event, skip the enter event
            if( enter ) { e.target.blur(); return; }

            if( name && name !== this.last )
            {
                if( this.hasActiveTodos() ) { this.updateTodos( name ); }
                else { this.createTodos( name ); }
            }
        },

        // get total number of entries in a todos list
        getTodosTotal: function( todos )
        {
            if( typeof todos === "object" && todos.hasOwnProperty( "entries" ) )
            {
                return todos.entries.length || 0;
            }
            if( this.hasTodosEntries() )
            {
                return this.todos.entries.length || 0;
            }
            return 0;
        },

        // get number of done tasks in a todos list
        getTodosDone: function( todos )
        {
            if( typeof todos === "object" && todos.hasOwnProperty( "entries" ) )
            {
                return todos.entries.filter( function( todo ){ return todo.complete; } ).length || 0;
            }
            if( this.hasTodosEntries() )
            {
                return this.todos.entries.filter( function( todo ){ return todo.complete; } ).length || 0;
            }
            return 0;
        },

        // get number of done tasks remaining
        getTodosRemain: function( todos )
        {
            return ( this.getTodosTotal( todos ) - this.getTodosDone( todos ) );
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

        // show the sidebar
        showSidebar: function()
        {
            var right = document.querySelector( ".app-right" );
            if( right ) right.classList.add( "expanded" );
        },

        // hide the sidebar
        hideSidebar: function()
        {
            var right = document.querySelector( ".app-right" );
            if( right ) right.classList.remove( "expanded" );
        },

        // load saved data from store
        loadData: function()
        {
            try {
                var lists = localStorage.getItem( this.keys.lists ) || "[]";
                lists = JSON.parse( lists );

                var options = localStorage.getItem( this.keys.options ) || "{}";
                options = JSON.parse( options );

                this.lists   = lists   || [];
                this.options = options || [];
                return true;
            }
            catch( e ) {
                notify.error( "Could not load app data, check the console for more information." );
                console.warn( e );
            }
            return false;
        },

        // save local data to store
        saveData: function( message, data )
        {
            try {
                var json = JSON.stringify( data || this.lists );
                localStorage.setItem( this.keys.lists, json );

                if( message && typeof message === "string" ) {
                    notify.success( message );
                }
                return true;
            }
            catch( e ) {
                notify.error( "Could not save app data, check the console for more information." );
                console.warn( e );
            }
            return false;
        },

        // save local data to store
        saveOptions: function( message, data )
        {
            try {
                var json = JSON.stringify( data || this.options );
                localStorage.setItem( this.keys.options, json );

                if( message && typeof message === "string" ) {
                    notify.success( message );
                }
                return true;
            }
            catch( e ) {
                notify.error( "Could not save app options, check the console for more information." );
                console.warn( e );
            }
            return false;
        },

        // import loaded json data from a file
        importData: function( data )
        {
            try { data = JSON.parse( data || "" ) || {}; }
            catch( e ) { console.warn( e ); }

            if( data && typeof data === "object" )
            {
                if( data.hasOwnProperty( "lists" ) )
                {
                    this.lists = data.lists;
                    this.saveData();
                }
                if( data.hasOwnProperty( "options" ) )
                {
                    this.options = data.options;
                    this.saveOptions();
                }
                this.showNotice( "success", "App data has been imported and saved." );
            }
        },

        // flush todos all data
        flushData: function()
        {
            var self = this;

            new Prompt({
                title: "Confirm...",
                confirm: "Delete all data saved by this app?",
                onAccept: function()
                {
                    self.lists = [];
                    self.unselectTodos();
                    self.saveData( "App data has been deleted." );
                }
            });
        },

        // try to parse a path and resume previous entries state
        setRoute: function( path )
        {
            path = ( typeof path === "string" ) ? path.replace( /^([\#\?]+)|([\/]+)$/, "" ) : "";

            if( path && path !== this.path )
            {
                this.path = path;

                var parts  = path.replace( /^([\#\?\/]+)|([\/]+)$/, "" ).split( "/" );
                var action = parts.length ? parts.shift() : "home";
                var item   = parts.length ? parts.shift() : "";

                switch( action )
                {
                    case "home"    :  return this.setComponent( "welcome" );
                    case "options" :  return this.setComponent( "options" );
                    case "list"    :  return this.selectTodos( item );
                    default        :  return this.setComponent( "notfound" );
                }
            }
        },

        // when url hash changes
        hashChange: function( e )
        {
            this.setRoute( window.location.hash );
        },
    },

    // before component mounted
    beforeMount: function()
    {
        window.addEventListener( "hashchange", this.hashChange );
        this.loadData();
    },

    // component mounted
    mounted: function()
    {
        var hash = window.location.hash || "";
        if( hash ) { this.setRoute( hash ); } // resume or go home
        else { this.setComponent( "welcome", "/home" ); }
    },
}
</script>


<style lang="scss">
@import "../scss/variables";
@import "../scss/reset";
@import "../scss/modifiers";
@import "../scss/fontello";
@import "../scss/type";
@import "../scss/buttons";
@import "../scss/dropdowns";
@import "../scss/links";
@import "../scss/flexbox";
@import "../scss/forms";
@import "../scss/shadows";
@import "../scss/utils";
@import "../scss/notify";
@import "../scss/prompt";
@import "../scss/tooltip";
@import "../scss/sortable";
@import "../scss/app";
@import "../scss/tasklist";
@import "../scss/savedlists";
</style>