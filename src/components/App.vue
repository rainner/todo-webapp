
<template>
    <div class="app-wrap">
        <!-- fixed header -->
        <topbar :component="comp" :user="user" :options="options" :lists="lists" :todos="todos"></topbar>
        <!-- app columns container -->
        <main class="app-columns">
            <section class="app-left" @mouseup="hideSidebar()" style="background-image: url( public/img/check.svg )">
                <component :is="comp" :user="user" :options="options" :lists="lists" :todos="todos"></component>
            </section>
            <aside class="app-right" :class="{ 'active': sidebar.active, 'visible': sidebar.visible }" @click="hideSidebar()">
                <sidebar class="app-sidebar" :user="user" :options="options" :lists="lists" :todos="todos"></sidebar>
            </aside>
        </main>
    </div>
</template>

<style lang="scss">
@import "../scss/variables";
@import "../scss/base";
@import "../scss/fontawesome";
@import "../scss/type";
@import "../scss/forms";
@import "../scss/buttons";
@import "../scss/dropdowns";
@import "../scss/shadows";
@import "../scss/utils";
@import "../scss/animations";
@import "../scss/notify";
@import "../scss/prompt";
@import "../scss/tooltip";
@import "../scss/sortable";
@import "../scss/app";
@import "../scss/topbar";
@import "../scss/sidebar";
@import "../scss/todos";
@import "../scss/modifiers";
</style>

<script>
// storage
import localforage from "localforage";
import firebase from "firebase/app";
import {} from "firebase/auth";
import {} from "firebase/database";
// components
import TopBar from "./Topbar.vue";
import Sidebar from "./Sidebar.vue";
import Home from "./Home.vue";
import Todos from "./Todos.vue";
import Options from "./Options.vue";
import About from "./About.vue";
import NotFound from "./NotFound.vue";
// custom scripts
import Notify from "../scripts/Notify";
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
const notify = new Notify();
const database = firebase.database();
const defaultOptions = {
    taskInsertPosition: "bottom", // (top, bottom)
    listInsertPosition: "top", // (top, bottom)
    listAutoSelect: true, // select new lists
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
            options  : Object.assign( {}, defaultOptions ),
            user     : {}, // firebase auth user data
            lists    : [], // sorted list of todos objects
            todos    : {}, // current selected todos object
            message  : "", // asyc success message to show
            path     : "", // current url hash path
            comp     : "home", // current active component
            sidebar  : { // sidebar state controls
                active: false,
                visible: false,
            }
        }
    },

    // component methods
    methods: {

        // call a function or emit an event
        emit: function() {
            let args = [].slice.call( arguments );
            let func = args.shift();

            if ( typeof this[ func ] === "function" ) {
                return this[ func ].apply( this, args );
            }
            return this.$emit.apply( this, arguments );
        },

        // common handler for async errors
        onError: function( e ) {
            notify.error( "Data Error: " + ( e.message || "There was a problem loading or saving data." ) , 8000 );
            this.$emit( "hideSpinner" );
            this.onHashChange();
        },

        // common handler for async successful operations
        onSuccess: function() {
            if ( this.message && typeof this.message === "string" ) {
                notify.success( this.message );
            }
            this.$emit( "hideSpinner" );
            this.message = "";
        },

        // save data to storage
        saveData: function( path, data, message ) {
            if ( path && typeof path === "string" && path !== "/" ) {
                path = path.replace( /^([\/]+)|([\/]+)$/, "" );
                this.$emit( "showSpinner" );
                this.message = message || "";

                if ( this.user.uid ) { // logged in
                    return database.ref( "/users/" + this.user.uid + "/" + path ).set( data ).then( this.onSuccess ).catch( this.onError );
                }
                switch ( path.split( "/" )[ 0 ] || "" ) {
                    case "options" : return localforage.setItem( "options", this.options ).then( this.onSuccess ).catch( this.onError );
                    case "lists"   : return localforage.setItem( "lists", this.lists ).then( this.onSuccess ).catch( this.onError );
                }
            }
            return false;
        },

        // remove data from storage
        removeData: function( path, message ) {
            if ( path && typeof path === "string" && path !== "/" ) {
                path = path.replace( /^([\/]+)|([\/]+)$/, "" );
                this.$emit( "showSpinner" );
                this.message = message || "";

                if ( this.user.uid ) { // logged in
                    return database.ref( "/users/" + this.user.uid + "/" + path ).remove().then( this.onSuccess ).catch( this.onError );
                }
                switch ( path.split( "/" )[ 0 ] || "" ) {
                    case "options" : return localforage.removeItem( "options" ).then( this.onSuccess ).catch( this.onError );
                    case "lists"   : return localforage.removeItem( "lists" ).then( this.onSuccess ).catch( this.onError );
                }
            }
            return false;
        },

        // reset app data to default
        resetData: function() {
            this.todosUnselect();
            this.options = Object.assign( {}, defaultOptions );
            this.lists = [];
        },

        // set new component view and location hash
        setComponent: function( comp, path ) {
            this.todos = {};

            if ( comp && typeof comp === "string" && comp !== this.comp ) {
                this.hideSidebar();
                this.comp = comp;
            }
            if ( path && typeof path === "string" && path !== this.path ) {
                window.location.hash = path;
                this.path = path;
            }
            return comp;
        },

        // update app state from url hash change
        onHashChange: function( e ) {
            let hash = window.location.hash || "/home";
            let path = hash.replace( /^([\#\?]+)|([\/]+)$/, "" );

            if ( path ) {
                this.path  = path;
                let parts  = path.replace( /^([\#\?\/]+)|([\/]+)$/, "" ).split( "/" );
                let action = parts.length ? parts.shift() : "home";
                let item   = parts.length ? parts.shift() : "";

                switch ( action ) {
                    case "home"    :  return this.setComponent( "home" );
                    case "options" :  return this.setComponent( "options" );
                    case "about"   :  return this.setComponent( "about" );
                    case "todos"   :  return this.todosSelect( item );
                }
                return this.setComponent( "notfound" );
            }
        },

        // check if a todos object is valid
        todosValid: function( todos ) {
            return ( typeof todos === "object" && todos.hasOwnProperty( "key" ) && todos.key );
        },

        // check if there is an active todos selected
        todosActive: function() {
            return this.todosValid( this.todos );
        },

        // select a todos list to be active
        todosSelect: function( search ) {
            let index = null;

            if ( /^([\d]+)$/.test( search ) ) {
                index = parseInt( search );
            }
            else if ( /^([\w\-\.]+)$/.test( search ) ) {
                for ( let i = 0; i < this.lists.length; ++i ) {
                    if ( this.lists[ i ].key === search ) {
                        index = i; break;
                    }
                }
            }
            if ( index !== null && typeof this.lists[ index ] === "object" ) {
                this.setComponent( "todos", "/todos/" + search );
                this.todos = Object.assign( {}, this.lists[ index ] );
                return true;
            }
            this.setComponent( "notfound" );
            return false;
        },

        // clear current todos data
        todosUnselect: function() {
            if ( this.comp === "todos" ) {
                this.setComponent( "home", "/home" );
            }
            this.todos = {};
        },

        // reselect active todos from main list
        todosReselect: function() {
            if ( this.todosActive() ) {
                return this.todosSelect( this.todos.key );
            }
            return false;
        },

        // replace todos object back in the list by it's key
        todosReplace: function( todos ) {
            if ( this.todosValid( todos ) ) {
                for ( let i = 0; i < this.lists.length; ++i ) {
                    if ( this.lists[ i ].key === todos.key ) {
                        this.lists[ i ] = Object.assign( {}, todos );
                        return true;
                    }
                }
            }
            return false;
        },

        // get index of todos from main list if it exists
        todosGetIndex: function( todos ) {
            if ( this.todosValid( todos ) ) {
                for ( let i = 0; i < this.lists.length; ++i ) {
                    if ( this.lists[ i ].key === todos.key ) return i;
                }
            }
            return -1;
        },

        // insert new todos to main list
        todosInsert: function( todos, message ) {
            if ( this.todosValid( todos ) ) {
                switch ( this.options.listInsertPosition ) {
                    case "bottom" : this.lists.push( todos ); break;
                    default       : this.lists.splice( 0, 0, todos );
                }
                if ( this.options.listAutoSelect ) {
                    this.todosSelect( todos.key );
                }
                return this.saveData( "lists", this.lists, message );
            }
            return false;
        },

        // update todos data on main list
        todosUpdate: function( todos, message ) {
            if ( this.todosValid( todos ) ) {
                this.todosReplace( todos );
                this.todosReselect();
                let index = this.todosGetIndex( todos );
                return this.saveData( "lists/" + index, todos, message );
            }
            return false;
        },

        // delete todos data from main list
        todosDelete: function( todos, message ) {
            let index = this.todosGetIndex( todos );
            if ( index > -1 ) {
                let current = this.todosGetIndex( this.todos );
                if ( current === index ) this.todosUnselect();
                this.lists.splice( index, 1 );
                return this.saveData( "lists", this.lists, message );
            }
            return false;
        },

        // save options data
        saveOptions: function( options, message ) {
            if ( typeof options === "object" ) {
                this.options = Object.assign( this.options, options );
                return this.saveData( "options", this.options, message );
            }
            return false;
        },

        // save lists data
        saveLists: function( lists, message ) {
            if ( Array.isArray( lists ) ) {
                this.lists = lists;
                this.todosReselect();
                return this.saveData( "lists", this.lists, message );
            }
            return false;
        },

        // clear and save default app data
        saveDefaults: function() {
            this.resetData();
            this.saveData( "options", this.options, "Options have been set to default." );
            this.saveData( "lists", this.lists, "Todos data have been reset." );
        },

        // import app options
        importOptions: function( data, save ) {
            if ( data !== null && typeof data === "object" ) {
                this.options = Object.assign( {}, defaultOptions, data );
                if ( save ) this.saveData( "options", this.options, "Options have been loaded and saved." );
            }
        },

        // import app lists
        importLists: function( data, save ) {
            if ( data !== null && ( typeof data === "object" || Array.isArray( data ) ) ) {
                let lists = [];
                let time  = Date.now();
                let date  = Utils.dateString();
                let keys  = Object.keys( data );
                let deft  = {
                    key      : "",
                    time     : time,
                    expire   : 0,
                    modified : date,
                    name     : date,
                    tasks    : [],
                };
                for ( let i = 0; i < keys.length; ++i ) {
                    let todos = data[ keys[ i ] ];

                    if ( todos.id ) { // deprecated
                        todos.key = todos.id;
                        delete todos.id;
                    }
                    if ( todos.key ) {
                        todos.tasks = Utils.objectToArray( todos.tasks || [] );

                        for ( let t = 0; t < todos.tasks.length; ++t ) {
                            if ( todos.tasks[ t ].id ) { // deprecated
                                todos.tasks[ t ].key = todos.tasks[ t ].id;
                                delete todos.tasks[ t ].id;
                            }
                        }
                        lists.push( Object.assign( {}, deft, todos ) );
                    }
                }
                this.lists = lists;
                if ( save ) this.saveData( "lists", this.lists, "Todos data has been loaded and saved." );
            }
            this.$emit( "hideSpinner" );
            this.onHashChange();
        },

        // import data loaded from remote db
        onAuthData: function( snapshot ) {
            if ( snapshot && snapshot.val() !== null ) {
                this.importOptions( snapshot.val().options || {} );
                this.importLists( snapshot.val().lists || [] );
            }
        },

        // on firebase user auth change
        onAuthChange: function( user ) {
            this.$emit( "showSpinner" );
            this.user = {};

            if ( user !== null && user.uid ) {
                this.user = {
                    uid      : user.uid,
                    name     : user.providerData[ 0 ].displayName,
                    email    : user.providerData[ 0 ].email,
                    photo    : user.providerData[ 0 ].photoURL,
                    provider : user.providerData[ 0 ].providerId,
                };
                database.ref( "/users/" + user.uid ).once( "value" ).then( this.onAuthData );
                return notify.success( "You have signed in using " + this.user.provider + "." );
            }
            localforage.getItem( "options" ).then( this.importOptions );
            localforage.getItem( "lists" ).then( this.importLists );
        },

        // firebase login using a provider and user creds
        userLogin: function( type, email, pass ) {
            if ( type && typeof type === "string" ) {
                let provider = null;

                switch ( type ) {
                    case "email"    :  provider = new firebase.auth.signInWithEmailAndPassword( email, pass );  break;
                    case "google"   :  provider = new firebase.auth.GoogleAuthProvider();   break;
                    case "twitter"  :  provider = new firebase.auth.TwitterAuthProvider();  break;
                    case "facebook" :  provider = new firebase.auth.FacebookAuthProvider(); break;
                    case "github"   :  provider = new firebase.auth.GithubAuthProvider();   break;
                }
                if ( provider ) {
                    return firebase.auth().signInWithPopup( provider ).catch( this.onError );
                }
                return notify.warning( "Invalid login provider type ("+ type +")." );
            }
            return notify.warning( "No login provider type specified." );
        },

        // firebase signoff
        userLogoff: function() {
            firebase.auth().signOut()
            .then( function() { notify.success( "You are no longer signed in." ); } )
            .catch( this.onError );
        },

        // show the sidebar
        showSidebar: function() {
            this.sidebar.active = true;
            this.sidebar.visible = true;
        },

        // hide the sidebar
        hideSidebar: function() {
            this.sidebar.visible = false;
            setTimeout( () => { this.sidebar.active = false; }, 500 );
        },

        // toggle the sidebar
        toggleSidebar: function() {
            if ( this.sidebar.active ) { this.hideSidebar(); }
            else { this.showSidebar(); }
        },

        // show notification
        showNotice: function( type, info, time ) {
            notify.add( type, info, time );
        },
    },

    // before mounted
    beforeMount: function() {
        firebase.auth().onAuthStateChanged( this.onAuthChange );
    },

    // component mounted
    mounted: function() {
        window.addEventListener( "hashchange", this.onHashChange );
    },

    // component destroyed
    destroyed: function() {
        window.removeEventListener( "hashchange", this.onHashChange );
    },
}
</script>
