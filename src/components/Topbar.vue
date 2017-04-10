
<template>
    <header class="header-wrap">
        <nav class="header-nav">

            <div class="header-icon" @click="emit( 'setComponent', 'home', '/home' )">
                <span :class="spinnerClass()"></span>
            </div>

            <div class="header-input">
                <input type="text"
                    placeholder="New list name..."
                    autocomplete="off"
                    v-model="todos.name"
                    @focus="onFocus( $event )"
                    @keyup.enter="todosInput( $event, 1 )"
                    @blur="todosInput( $event )" />
            </div>

            <div class="header-btn" @click="todosCreate()">
                <span class="icon-plus text-success-hover" title="New list" v-tooltip></span>
            </div>

            <div class="header-btn" id="sidebar-toggle-btn" @click="emit( 'toggleSidebar' )">
                <span class="icon-book text-grey-hover" title="Saved lists" v-tooltip></span>
            </div>

            <div class="header-btn dropdown" v-dropdown>
                <span class="icon-menu text-secondary-hover dropdown-trigger" id="main-menu-trigger"></span>
                <ul class="dropdown-left dropdown-bottom">
                    <li :class="{ 'active': ( component === 'home' ) }"><a href="#/home" class="icon-home icon-pr">App home</a></li>
                    <li :class="{ 'active': ( component === 'options' ) }"><a href="#/options" class="icon-user icon-pr">Account &amp; options</a></li>
                    <li :class="{ 'active': ( component === 'about' ) }"><a href="#/about" class="icon-code icon-pr">About this app</a></li>
                    <li v-if="hasTasks()"><a href="#" class="icon-check icon-pr text-success-hover" @click.prevent="emit( 'tasksToggle', true )">Check all tasks</a></li>
                    <li v-if="hasTasks()"><a href="#" class="icon-clock icon-pr text-warning-hover" @click.prevent="emit( 'tasksToggle', false )">Uncheck all tasks</a></li>
                    <li v-if="hasTasks()"><a href="#" class="icon-flag icon-pr text-info-hover" @click.prevent="emit( 'tasksClean' )">Remove complete tasks</a></li>
                    <li v-if="hasTasks()"><a href="#" class="icon-trash icon-pr text-danger-hover" @click.prevent="emit( 'tasksFlush' )">Remove all tasks</a></li>
                    <li v-if="hasTodos()"><a href="#" class="icon-x icon-pr text-danger-hover" @click.prevent="todosDelete()">Delete todos list</a></li>
                </ul>
            </div>

        </nav>
    </header>
</template>


<script>
// custom scripts
import Prompt from "../scripts/Prompt";
import Utils from "../scripts/Utils";

// component
export default {

    // component props
    props: {
        component: { type: String, default: "", required: false },
        user: { type: Object, default: {}, required: false },
        options: { type: Object, default: {}, required: false },
        lists: { type: Array, default: [], required: false },
        todos: { type: Object, default: {}, required: false },
    },

    // component data
    data: function() {
        return {
            spinner: false,
            sto: null,
        };
    },

    // component methods
    methods: {

        // for passing method calls to parent
        emit: function()
        {
            return this.$parent.emit.apply( this.$parent, arguments );
        },

        // force trigger main menu dropdown
        showMenu: function()
        {
            var menu = document.getElementById( "main-menu-trigger" );
            if( menu ) menu.click();
        },

        // show spinner
        showSpinner: function()
        {
            if( this.sto ) clearTimeout( this.sto );
            this.sto = setTimeout( this.hideSpinner, 10000 ); // just in case
            this.spinner = true;
        },

        // hide spinner
        hideSpinner: function()
        {
            if( this.sto ) clearTimeout( this.sto );
            this.sto = null;
            this.spinner = false;
        },

        // get computed spinner class
        spinnerClass: function()
        {
            if( this.spinner ) return "icon-reload icon-spin text-secondary";
            return "icon-tasks text-primary-hover";
        },

        // capture previous value of input to compare later when saving
        onFocus: function( e )
        {
            this.last = e.target.value || "";
        },

        // check if there is an active todos selected
        hasTodos: function()
        {
            return ( this.todos.hasOwnProperty( "key" ) );
        },

        // check if there are tasks in active todos
        hasTasks: function()
        {
            return ( this.todos.hasOwnProperty( "tasks" ) && this.todos.tasks.length );
        },

        // catch input event to change todos name or create a new list
        todosInput: function( e, enter )
        {
            var name = e.target.value || "";

            if( enter ) // enter key, use blur instead
            {
                e.target.blur();
                return;
            }
            if( !name ) // blank input, use last value
            {
                e.target.value = this.last;
                this.todos.name = this.last;
                return;
            }
            if( name && name !== this.last ) // new value
            {
                if( this.hasTodos() )
                {
                    return this.todosRename( name );
                }
                return this.todosCreate( name );
            }
        },

        // add new todos-list to the list and select it
        todosCreate: function( name )
        {
            var key   = Utils.idString();
            var date  = Utils.dateString();
            var time  = Date.now();
            var todos = {
                key      : key,
                time     : time,
                expire   : 0,
                modified : date,
                name     : name || date,
                tasks    : [],
            };
            this.emit( "todosInsert", todos, "New todos list has been created." );
        },

        // update selected todos data
        todosRename: function( name )
        {
            if( this.hasTodos() && name && typeof name === "string" )
            {
                this.todos.name = name;
                this.emit( "todosUpdate", this.todos, "Todos list name has been updated." );
            }
        },

        // delete current todos
        todosDelete: function()
        {
            if( this.hasTodos() )
            {
                var _delete = function()
                {
                    this.emit( "todosDelete", this.todos, "Todos list has been deleted." );
                };
                new Prompt({
                    title: "Confirm...",
                    confirm: "Delete this todos list?",
                    onAccept: _delete.bind( this ),
                });
            }
        },

    },

    // component before mount
    beforeMount: function()
    {
        // register methods that need to be called from outside
        this.$parent.$on( "showMenu", this.showMenu );
        this.$parent.$on( "showSpinner", this.showSpinner );
        this.$parent.$on( "hideSpinner", this.hideSpinner );
        this.$parent.$on( "todosCreate", this.todosCreate );
    },

    // component before destroy
    beforeDestroy: function()
    {
        this.$parent.$off( "showMenu" );
        this.$parent.$off( "showSpinner" );
        this.$parent.$off( "hideSpinner" );
        this.$parent.$off( "todosCreate" );
    },

};
</script>
