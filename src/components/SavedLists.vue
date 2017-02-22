
<template>
    <!-- component wrapper -->
    <div class="app-saved-lists">

        <!-- saved lists heading -->
        <div class="heading-wrap flex-row fles-space flex-middle">
            <div class="icon-folder icon-pr">
                <span>Saved Lists</span>
                <span class="text-default">({{ lists.length }})</span>
            </div>
        </div>

        <!-- saved lists items -->
        <div class="saved-list-wrap">
            <ul v-if="lists.length" class="saved-list-container">
                <li v-for="(todos, index) in lists" class="saved-list-item" :class="{ 'active': isActiveList( index ) }">
                    <a class="saved-list-title icon-list icon-pr" href="#" title="Manage" @click.prevent="selectTodos( index )" v-html="todos.name" v-tooltip></a> <hr />
                    <span class="saved-list-pill saved-list-total" v-html="getTodosTotal( todos ) + ' total'"></span>
                    <span class="saved-list-pill saved-list-done" v-html="getTodosDone( todos ) + ' done'"></span>
                </li>
            </ul>
            <div v-else class="text-grey pad-bottom">
                The todo lists you create will be shown here.
                You can click on the name of a list to select it.
            </div>
            <a class="btn bg-success-hover icon-plus icon-pr shadow-paper" href="#" @click.prevent="createTodos()">New List</a>
        </div>

    </div>
</template>

<script>
/**
 * Saved lists component
 */
export default {

    // component name
    name: "savedlists",

    // component props
    props: {
        lists: { type: Array, default: [], required: true },
    },

    // app data
    data() {
        return {

        }
    },

    // custom dom element manipulations
    directives: {

        // apply tooltip text
        tooltip: {
            bind: function( el, binding, vnode ) {
                vnode.context.$parent.addTooltip( el );
            },
            unbind: function( el, binding, vnode ) {
                vnode.context.$parent.removeTooltip( el );
            },
        },
    },

    // app methods
    methods: {

        // check if sidebar is is current selected list
        isActiveList: function( index )
        {
            return this.$parent.isActiveList( index );
        },

        // select a todos list to be active from sidebar
        selectTodos: function( index )
        {
            this.$parent.selectTodos( index );
        },

        // add new todos-list to the list and select it
        createTodos: function( name )
        {
            this.$parent.createTodos( name );
        },

        // get total number of entries in a todos list
        getTodosTotal: function( todos )
        {
            if( typeof todos === "object" && todos.hasOwnProperty( "entries" ) )
            {
                return todos.entries.length || 0;
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
            return 0;
        },

    },
}
</script>
