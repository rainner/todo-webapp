
<template>
    <!-- component wrapper -->
    <div class="app-saved-lists">

        <div class="saved-list-wrap">

            <h4 class="icon-book icon-pr">Saved Lists</h4>

            <ul v-if="lists.length" class="saved-list-container">
                <li v-for="(todos, index) in lists" class="saved-list-item" :class="{ 'active': isActiveList( index ) }" @click.prevent="selectTodos( index )">
                    <a class="saved-list-title icon-tasks icon-pr" href="#" v-html="todos.name" @click.prevent="selectTodos( index )"></a> <hr />
                    <span class="saved-list-pill saved-list-total" v-html="getTodosTotal( todos ) + ' total'"></span>
                    <span class="saved-list-pill saved-list-done" v-html="getTodosDone( todos ) + ' done'"></span>
                    <span class="saved-list-pill saved-list-remain" v-html="getTodosRemain( todos ) + ' remain'"></span>
                </li>
            </ul>
            <div v-else class="text-grey pad-bottom">
                The todo lists you create will be shown here.
                You can click on the name of a list to select it.
            </div>
        </div>

    </div>
</template>


<script>
// component
export default {

    // component name
    name: "savedlists",

    // component props
    props: {
        lists: { type: Array, default: [], required: true },
        todos: { type: Object, default: [], required: false },
        options: { type: Object, default: {}, required: false },
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

        hasActiveTodos: function()
        {
            return this.$parent.hasActiveTodos();
        },

        hasTodosEntries: function()
        {
            return this.$parent.hasTodosEntries();
        },

        hideSidebar: function( e )
        {
            this.$parent.hideSidebar();
        },

        isActiveList: function( index )
        {
            return this.$parent.isActiveList( index );
        },

        selectTodos: function( index )
        {
            this.$parent.selectTodos( index );
        },

        createTodos: function( name )
        {
            this.$parent.createTodos( name );
        },

        getTodosTotal: function( todos )
        {
            return this.$parent.getTodosTotal( todos );
        },

        getTodosDone: function( todos )
        {
            return this.$parent.getTodosDone( todos );
        },

        getTodosRemain: function( todos )
        {
            return this.$parent.getTodosRemain( todos );
        },

    },
}
</script>
