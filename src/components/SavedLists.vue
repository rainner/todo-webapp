
<template>
    <!-- component wrapper -->
    <div class="app-saved-lists">

        <!-- saved lists heading -->
        <div class="saved-list-heading heading-wrap flex-row fles-space flex-middle">
            <div class="icon-folder icon-pr">
                <span>Saved Lists</span>
                <span class="text-default">({{ lists.length }})</span>
            </div>
        </div>

        <!-- saved lists items -->
        <div class="saved-list-wrap">
            <ul v-if="lists.length" class="saved-list-container">
                <li v-for="(todos, index) in lists" class="saved-list-item" :class="{ 'active': isActiveList( index ) }" @click.prevent="selectTodos( index )">
                    <a class="saved-list-title icon-calendar icon-pr" href="#" v-html="todos.name" @click.prevent="selectTodos( index )"></a> <hr />
                    <span class="saved-list-pill saved-list-total" v-html="getTodosTotal( todos ) + ' total'"></span>
                    <span class="saved-list-pill saved-list-done" v-html="getTodosDone( todos ) + ' done'"></span>
                </li>
            </ul>
            <div v-else class="text-grey pad-bottom">
                The todo lists you create will be shown here.
                You can click on the name of a list to select it.
            </div>
            <a class="saved-list-btn btn bg-success-hover icon-plus icon-pr shadow-paper" href="#" @click.prevent="createTodos()">New List</a>
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

        // hide sidebar on click
        hideSidebar: function( e )
        {
            this.$parent.hideSidebar();
        },

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
            return this.$parent.getTodosTotal( todos );
        },

        // get number of done tasks in a todos list
        getTodosDone: function( todos )
        {
            return this.$parent.getTodosDone( todos );
        },

    },
}
</script>
