
<template>
    <div class="app-saved-lists">

        <div class="saved-list-wrap">

            <div class="saved-list-heading">
                <h4 class="icon-book icon-pr">Saved Lists ({{ lists.length }})</h4>
                <span>Account: <a class="icon-key icon-pr text-document-hover" href="#/options" v-html="storageInfo()" title="Manage" v-tooltip></a></span>
            </div>

            <ul v-if="lists.length" class="saved-list-container">
                <li v-for="(todos, index) in lists" class="saved-list-item" :class="{ 'active': isActive( todos.id ) }" @click.prevent="emit( 'todosSelect', todos.id )">
                    <span class="saved-list-title icon-tasks icon-pr" v-html="todos.name"></span> <hr />
                    <span class="saved-list-pill saved-list-total" v-html="countTotal( todos ) + ' total'"></span>
                    <span class="saved-list-pill saved-list-done" v-html="countDone( todos ) + ' done'"></span>
                    <span class="saved-list-pill saved-list-remain" v-html="countRemain( todos ) + ' remain'"></span>
                </li>
            </ul>

            <div v-else class="saved-list-default">
                <hr />
                <p>There are no TODO lists available for this account.</p>
                <p>Click on the <a class="icon-plus icon-pr text-success-hover" href="#" @click.prevent="emit( 'todosCreate' )">New List</a> button to get started.</p>
            </div>
        </div>

    </div>
</template>


<script>
// component
export default {

    // component props
    props: {
        lists: { type: Array, default: [], required: true },
        todos: { type: Object, default: {}, required: true },
        options: { type: Object, default: {}, required: false },
        user: { type: Object, default: {}, required: false },
    },

    // app methods
    methods: {

        // for passing method calls to parent
        emit: function()
        {
            return this.$parent.emit.apply( this.$parent, arguments );
        },

        // check if the todos object is valid
        hasTodos: function()
        {
            return ( this.todos.id !== undefined && Array.isArray( this.todos.tasks ) );
        },

        // check if there are tasks in given todos list
        hasTasks: function( todos )
        {
            return ( Array.isArray( todos.tasks ) && todos.tasks.length );
        },

        // check if a give is is the active todos id
        isActive: function( id )
        {
            return ( this.hasTodos() && this.todos.id === id );
        },

        // get total number of entries in a todos list
        countTotal: function( todos )
        {
            return this.hasTasks( todos ) ? todos.tasks.length : 0;
        },

        // get number of done tasks in a todos list
        countDone: function( todos )
        {
            return this.hasTasks( todos ) ? todos.tasks.filter( function( task ){ return task.complete; } ).length : 0;
        },

        // get number of done tasks remaining
        countRemain: function( todos )
        {
            return this.countTotal( todos ) - this.countDone( todos );
        },

        // get info about db storage being used
        storageInfo: function()
        {
            if( this.user.provider )
            {
                return this.user.provider;
            }
            return "local database";
        },

    },
}
</script>
