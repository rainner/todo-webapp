
<template>
    <header class="header-wrap">
        <nav class="header-nav">

            <div class="header-icon" @click="emit( 'setComponent', 'home', '/home' )">
                <span v-if="spinner" class="icon-reload icon-spin text-secondary"></span>
                <span v-else class="icon-tasks text-primary-hover"></span>
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

            <div class="header-btn" @click="emit( 'todosCreate' )">
                <span class="icon-plus text-success-hover" title="New list" v-tooltip></span>
            </div>

            <div class="header-btn" id="sidebar-toggle-btn" @click="emit( 'toggleSidebar' )">
                <span class="icon-book text-grey-hover" title="Saved lists" v-tooltip></span>
            </div>

            <div class="header-btn dropdown" v-dropdown>
                <span class="icon-menu text-secondary-hover dropdown-trigger" id="main-menu-trigger"></span>
                <ul class="dropdown-tr">
                    <li><a href="#/home" class="icon-home icon-pr">App home</a></li>
                    <li v-if="hasTodos()"><a href="#" class="icon-check icon-pr text-success-hover" @click.prevent="emit( 'tasksToggle', true )">Check all tasks</a></li>
                    <li v-if="hasTodos()"><a href="#" class="icon-clock icon-pr text-warning-hover" @click.prevent="emit( 'tasksToggle', false )">Uncheck all tasks</a></li>
                    <li v-if="hasTodos()"><a href="#" class="icon-flag icon-pr text-info-hover" @click.prevent="emit( 'tasksClean' )">Remove complete tasks</a></li>
                    <li v-if="hasTodos()"><a href="#" class="icon-trash icon-pr text-danger-hover" @click.prevent="emit( 'tasksFlush' )">Remove all tasks</a></li>
                    <li v-if="hasTodos()"><a href="#" class="icon-x icon-pr text-danger-hover" @click.prevent="emit( 'todosDelete' )">Delete todos list</a></li>
                    <li><a href="#/options" class="icon-user icon-pr">Account &amp; options</a></li>
                    <li><a href="#/about" class="icon-code icon-pr">About this app</a></li>
                </ul>
            </div>

        </nav>
    </header>
</template>

<script>
/**
 * Welcome text component
 */
export default {

    // component props
    props: {
        todos: { type: Object, default: {}, required: false },
        options: { type: Object, default: {}, required: false },
        user: { type: Object, default: {}, required: false },
    },

    // component data
    data: function() {
        return {
            spinner: true,
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
            this.spinner = true;
        },

        // hide spinner
        hideSpinner: function()
        {
            this.spinner = false;
        },

        // capture previous value of input to compare later when saving
        onFocus: function( e )
        {
            this.last = e.target.value || "";
        },

        // check if the todos object is valid
        hasTodos: function()
        {
            return ( this.todos.id !== undefined && Array.isArray( this.todos.tasks ) );
        },

        // catch input event to change todos name or create a new list
        todosInput: function( e, enter )
        {
            var name = e.target.value || "";

            if( enter ) { e.target.blur(); return; }

            if( !name ) { e.target.value = this.last; return; }

            if( name && name !== this.last )
            {
                if( this.hasTodos() )
                {
                    return this.emit( 'todosUpdate', name );
                }
                return this.emit( 'todosCreate', name );
            }
        },

    },

    // setup sortable change handler
    beforeMount: function()
    {
        // register methods that need to be called from outside
        this.$parent.$on( "showMenu", this.showMenu );
        this.$parent.$on( "showSpinner", this.showSpinner );
        this.$parent.$on( "hideSpinner", this.hideSpinner );
    },
};
</script>
