
<template>
    <div class="app-saved-lists">

        <div class="saved-list-wrap">

            <div class="saved-list-heading">
                <h4 v-html="headingText()"></h4>
                <span>Account: <a class="icon-key icon-pr text-document-hover" href="#/options" v-html="storageInfo()" title="Manage" v-tooltip></a></span>
            </div>

            <ul v-if="countLists()" class="saved-list-container sortable">
                <li v-for="(todos, index) in lists" class="saved-list-item" :id="'list-' + index" :key="todos.key" :class="{ 'active': isActive( todos.key ) }" @click.prevent="emit( 'todosSelect', todos.key )" v-sortitem>

                    <div class="saved-list-date">
                        <span v-html="todos.modified"></span>
                    </div>

                    <div class="saved-list-title">
                        <span class="sort-handle icon-tasks"></span>
                        <span v-html="todos.name"></span>
                    </div>

                    <div class="saved-list-count">
                        <span class="saved-list-total" v-html="countTotal( todos ) + ' total'"></span>
                        <span class="saved-list-done" v-html="countDone( todos ) + ' done'"></span>
                        <span class="saved-list-remain" v-html="countRemain( todos ) + ' remain'"></span>
                    </div>

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
// dependencies
import Sortable from "../scripts/Sortable";
import Utils from "../scripts/Utils";

// setup sortable instance
var sortable = new Sortable( null, { uniqueAttribute: "id", moveHorizontal: false } );

// component
export default {

    // component props
    props: {
        user: { type: Object, default: {}, required: false },
        options: { type: Object, default: {}, required: false },
        lists: { type: Array, default: [], required: false },
        todos: { type: Object, default: {}, required: false },
    },

    // custom dom element manipulations
    directives: {

        // handle reactive sortable items
        sortitem: {
            bind: function( el, binding, vnode ) {
                sortable.add( el );
            },
            unbind: function( el, binding, vnode ) {
                sortable.remove( el );
            },
        },
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
            return ( this.todos.hasOwnProperty( "key" ) && this.todos.key );
        },

        // check if there are tasks in given todos list
        hasTasks: function( todos )
        {
            return ( Array.isArray( todos.tasks ) && todos.tasks.length );
        },

        // check if a give is is the active todos id
        isActive: function( key )
        {
            return ( this.hasTodos() && this.todos.key === key );
        },

        // count number of lists available
        countLists: function()
        {
            return this.lists.length || 0;
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

        // get text for sidebar heading
        headingText: function()
        {
            return "Saved Lists ("+ this.countLists() +")";
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

        // save new order of todo tasks
        listSort: function( indexes )
        {
            if( Array.isArray( indexes ) )
            {
                if( indexes.length === this.countLists() )
                {
                    var date  = Utils.dateString();
                    var lists = []; // fresh list

                    for( var i = 0; i < indexes.length; ++i )
                    {
                        lists[ i ] = Object.assign( {}, this.lists[ indexes[ i ] ] );
                    }
                    this.emit( "saveLists", lists, "New lists order has been saved." );
                }
            }
        },

        // reset sortable container when component mounts/updates
        setupSortable: function()
        {
            var list = document.querySelector( ".saved-list-container" );
            sortable.setContainer( list );
        },

    },

    // setup sortable change handler
    beforeMount: function()
    {
        var self = this;

        sortable.onChange( function() {
            self.listSort( this.getNumericOrder() );
        });
    },

    // component mounted
    mounted: function()
    {
        this.setupSortable();
    },

    // component updated
    updated: function()
    {
        this.setupSortable();
    },
}
</script>
