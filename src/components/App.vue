
<template>
    <div class="app-wrap">
        <!-- fixed header -->
        <topbar :todos="todos" :lists="lists" :options="options" :user="user"></topbar>
        <!-- app columns container -->
        <main class="app-columns">
            <div class="app-left" @mouseup="hideSidebar()" style="background-image: url( public/img/check.svg )">
                <component :is="comp" :todos="todos" :lists="lists" :options="options" :user="user"></component>
            </div>
            <div class="app-right" :class="{ 'expanded': expanded }">
                <sidebar :todos="todos" :lists="lists" :options="options" :user="user"></sidebar>
            </div>
        </main>
    </div>
</template>


<style lang="scss">
// app styles
@import "../scss/variables";
@import "../scss/base";
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
@import "../scss/topbar";
@import "../scss/sidebar";
@import "../scss/todos";
</style>


<script>
// storage
import localforage from "localforage";
import firebase from "firebase/app";
import {} from "firebase/auth";
import {} from "firebase/database";
// components
import TopBar from "./TopBar.vue";
import Sidebar from "./Sidebar.vue";
import Home from "./Home.vue";
import Todos from "./Todos.vue";
import Options from "./Options.vue";
import About from "./About.vue";
import NotFound from "./NotFound.vue";
// custom scripts
import Notify from "../scripts/Notify";
import Prompt from "../scripts/Prompt";
import Utils from "../scripts/Utils";

// setup localforage
localforage.config({
    name: "todoswebapp",
});

// setup firebase
firebase.initializeApp({
    apiKey: "AIzaSyAae9QnCPyaBzPAkRBmYbM6zKdFFNosBXI",
    authDomain: "todoswebapp.firebaseapp.com",
    databaseURL: "https://todoswebapp.firebaseio.com",
    storageBucket: "todoswebapp.appspot.com",
    messagingSenderId: "15015118956",
});

// globals
var notify = new Notify();
var database = firebase.database();
var defaultOptions = {
    // where to place newly added tasks (top, bottom)
    taskInsertPosition: "bottom",
    // where to place newly created lists (top, bottom)
    listInsertPosition: "top",
     // auto select newly created lists
    listAutoSelect: true,
};

// component
export default {

    // sub components
    components: {
        "topbar"   : TopBar,
        "sidebar"  : Sidebar,
        "home"     : Home,
        "todos"    : Todos,
        "options"  : Options,
        "about"    : About,
        "notfound" : NotFound,
    },

    // component data
    data: function() {
        return {
            expanded : false,    // control sidebar expanded class
            index    : -1,       // index of current selected todos list
            path     : "",       // keep track of url hash/path for app state
            comp     : "",       // current component selected to show
            lists    : [],       // all saved todos lists
            todos    : {},       // current active todos list data
            user     : {},       // auth user data using firebase API
            options  : Object.assign( {}, defaultOptions ),
        }
    },

    // component methods
    methods: {

        // call a function or emit an event
        emit: function()
        {
            var args = [].slice.call( arguments );
            var func = args.shift();

            if( typeof this[ func ] === "function" )
            {
                return this[ func ].apply( this, args );
            }
            return this.$emit.apply( this, arguments );
        },

        // common handler for async errors
        onError: function( e )
        {
            notify.error( e.message || "There has been a problem.", 8000 );
        },

        // show the sidebar
        showSidebar: function()
        {
            this.expanded = true;
        },

        // hide the sidebar
        hideSidebar: function()
        {
            this.expanded = false;
        },

        // toggle the sidebar
        toggleSidebar: function()
        {
            this.expanded = !this.expanded;
        },

        // show notification
        showNotice: function( type, info, time )
        {
            notify.add( type, info, time );
        },

        // set new component view and location hash
        setComponent: function( comp, path )
        {
            this.todosUnselect();

            if( comp && typeof comp === "string" && comp !== this.comp )
            {
                this.hideSidebar();
                this.comp = comp;
            }
            if( path && typeof path === "string" && path !== this.path )
            {
                window.location.hash = path;
                this.path = path;
            }
            return comp;
        },

        // update app state from url hash change
        onHashChange: function( e )
        {
            var hash = window.location.hash || "/home";
            var path = hash.replace( /^([\#\?]+)|([\/]+)$/, "" );

            if( path )
            {
                this.path  = path;
                var parts  = path.replace( /^([\#\?\/]+)|([\/]+)$/, "" ).split( "/" );
                var action = parts.length ? parts.shift() : "home";
                var item   = parts.length ? parts.shift() : "";

                switch( action )
                {
                    case "home"    :  return this.setComponent( "home" );
                    case "options" :  return this.setComponent( "options" );
                    case "about"   :  return this.setComponent( "about" );
                    case "todos"   :  return this.todosSelect( item );
                }
                return this.setComponent( "notfound" );
            }
        },

        // check if a todos list exists in the lists array
        todosExists: function( index )
        {
            index = ( index !== undefined ) ? index : this.index;
            return ( this.lists[ index ] !== undefined );
        },

        // select a todos list to be active
        todosSelect: function( lookup )
        {
            var id = "";
            var index = -1;

            if( typeof lookup === "number" ) // index
            {
                id = lookup + "";
                index = lookup;
            }
            else if( typeof lookup === "string" )
            {
                if( /^([0-9]+)$/.test( lookup ) ) // index
                {
                    id = lookup;
                    index = parseInt( lookup );
                }
                else if( /^([\w]+)$/.test( lookup ) ) // id hash
                {
                    for( var i = 0; i < this.lists.length; ++i )
                    {
                        if( this.lists[ i ].id === lookup )
                        {
                            id = this.lists[ i ].id;
                            index = i; break;
                        }
                    }
                }
            }
            if( this.todosExists( index ) )
            {
                this.hideSidebar();
                this.setComponent( "todos", "/todos/" + id );
                this.index = index;
                this.todos = Object.assign( {}, this.lists[ index ] );
                return;
            }
            this.setComponent( "notfound" );
        },

        // clear current selected todos list
        todosUnselect: function()
        {
            this.index = -1;
            this.todos = {};
        },

        // check if there is an active todos selected
        todosSelected: function()
        {
            return ( this.index !== -1 && this.todos.id !== undefined );
        },

        // add new todos-list to the list and select it
        todosCreate: function( name )
        {
            var id    = Utils.randString( 10 );
            var date  = Utils.dateString();
            var todos = {
                id       : id,
                time     : Date.now(),
                modified : date,
                name     : name || date,
                tasks    : [],
            };
            switch( this.options.listInsertPosition )
            {
                case "bottom" : this.lists.push( todos ); break;
                default       : this.lists.splice( 0, 0, todos );
            }
            if( this.options.listAutoSelect )
            {
                this.todosSelect( id );
            }
            this.saveLists( "New todos list has been created." );
        },

        // update current selected todos-list name
        todosUpdate: function( data )
        {
            if( this.todosSelected() && data )
            {
                if( typeof data === "string" )
                {
                    this.todos.name = data;
                    this.todosSave( this.todos, "Todos list name has been changed." );
                }
                else if( typeof data === "object" )
                {
                    this.todos = Object.assign( this.todos, data );
                    this.todosSave( this.todos, "Todos list data has been changed." );
                }
            }
        },

        // empty current todos list
        todosEmpty: function()
        {
            if( this.todosSelected() )
            {
                var self = this;

                new Prompt({
                    title: "Confirm...",
                    confirm: "Remove all tasks from this list?",
                    onAccept: function()
                    {
                        self.todos.tasks = [];
                        self.todosSave( self.todos, "Todos list has been flushed." );
                    }
                });
            }
        },

        // delete selected todos-list from the list
        todosDelete: function()
        {
            if( this.todosSelected() )
            {
                var self = this;

                new Prompt({
                    title: "Confirm...",
                    confirm: "Delete this list?",
                    onAccept: function()
                    {
                        self.lists.splice( self.index, 1 );
                        self.setComponent( "home", "/home" );
                        self.saveLists( "Todos list has been deleted." );
                    }
                });
            }
        },

        // save new todos data for current active list index
        todosSave: function( todos, message )
        {
            if( this.todosSelected() && typeof todos === "object" && todos.id !== undefined )
            {
                todos.modified = Utils.dateString();
                this.todos = todos;
                this.lists.splice( this.index, 1, Object.assign( {}, todos ) );
                this.saveLists( message );
            }
        },

        // reset app data to default
        resetData: function( redirect )
        {
            if( redirect && this.comp === "todos" )
            {
                this.setComponent( "home", "/home" );
            }
            this.todosUnselect();
            this.options = Object.assign( {}, defaultOptions );
            this.lists = [];
        },

        // set data for the application
        importData: function( data, save )
        {
            if( data && typeof data === "object" )
            {
                if( data.options && typeof data.options === "object" )
                {
                    this.options = Object.assign( {}, defaultOptions, data.options );
                    if( save ) this.saveOptions( "Options have been loaded and saved." );
                }
                if( data.lists && Array.isArray( data.lists ) )
                {
                    var date  = Utils.dateString();
                    var lists = [];

                    for( var i = 0; i < data.lists.length; ++i )
                    {
                        var todos = data.lists[ i ];
                        if( !todos.id ) { todos.id = Utils.randString(); }
                        if( !todos.modified ) { todos.modified = date; }
                        if( !todos.name ) { todos.name = date; }
                        if( !todos.tasks ) { todos.tasks = []; }
                        lists.push( todos );
                    }
                    this.lists = lists;
                    if( save ) this.saveLists( "Todos data has been loaded and saved." );
                }
            }
            this.onHashChange();
            this.$emit( "hideSpinner" );
        },

        // save app data to storage (local or remote)
        saveData: function( key, data, message )
        {
            if( key && typeof key === "string" && data !== undefined )
            {
                if( this.user.uid ) // logged in, save to remote db
                {
                    return database.ref( "/users/" + this.user.uid + "/" + key ).set( data ).then( function() {
                        if( message ) notify.success( message );
                    }).catch( this.onError );
                }
                return localforage.setItem( key, data ).then( function() {
                    if( message ) notify.success( message );
                }).catch( this.onError );
            }
        },

        // alias for saving options data
        saveOptions: function( message )
        {
            this.saveData( "options", this.options, message );
        },

        // alias for saving lists data
        saveLists: function( message )
        {
            this.saveData( "lists", this.lists, message );
        },

        // load app data from local db
        loadData: function()
        {
            var self = this;

            localforage.getItem( "options" )
            .then( function( data ) { self.importData( { options: data } ); } )
            .catch( this.onError );

            localforage.getItem( "lists" )
            .then( function( data ) { self.importData( { lists: data } ); } )
            .catch( this.onError );
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
                    self.resetData( true );
                    self.saveOptions( "Options have been set to default." );
                    self.saveLists( "Todos data have been deleted." );
                }
            });
        },

        // import data loaded from remote db
        onAuthData: function( data )
        {
            if( data.val() !== null )
            {
                this.importData( data.val() );
            }
        },

        // on firebase user auth change
        onAuthChange: function( user )
        {
            this.resetData();
            this.$emit( "showSpinner" );

            if( user !== null )
            {
                this.user = {
                    uid      : user.uid,
                    name     : user.providerData[ 0 ].displayName,
                    email    : user.providerData[ 0 ].email,
                    photo    : user.providerData[ 0 ].photoURL,
                    provider : user.providerData[ 0 ].providerId,
                };
                // logged in, load data from remote db
                database.ref( "/users/" + user.uid ).once( "value" ).then( this.onAuthData );
                notify.success( "You have signed in using " + this.user.provider + "." );
                return;
            }
            // not logged in, load data from local db
            this.loadData();
            this.user = {};
        },

        // firebase login using a provider and user creds
        userLogin: function( type, email, pass )
        {
            if( type && typeof type === "string" )
            {
                var provider = null;

                switch( type )
                {
                    case "email"    :  provider = new firebase.auth.signInWithEmailAndPassword( email, pass );  break;
                    case "google"   :  provider = new firebase.auth.GoogleAuthProvider();   break;
                    case "twitter"  :  provider = new firebase.auth.TwitterAuthProvider();  break;
                    case "facebook" :  provider = new firebase.auth.FacebookAuthProvider(); break;
                    case "github"   :  provider = new firebase.auth.GithubAuthProvider();   break;
                }
                if( provider )
                {
                    return firebase.auth().signInWithPopup( provider ).catch( this.onError );
                }
                return notify.warning( "Invalid login provider type ("+ type +")." );
            }
            return notify.warning( "No login provider type specified." );
        },

        // firebase signoff
        userLogoff: function()
        {
            firebase.auth().signOut()
            .then( function() { notify.success( "You are no longer signed in." ); } )
            .catch( this.onError );
        },
    },

    // before mounted
    beforeMount: function()
    {
        firebase.auth().onAuthStateChanged( this.onAuthChange );
    },

    // component mounted
    mounted: function()
    {
        window.addEventListener( "hashchange", this.onHashChange );
    },

    // component destroyed
    destroyed: function()
    {
        window.removeEventListener( "hashchange", this.onHashChange );
    },
}
</script>
