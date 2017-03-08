
<template>
    <!-- component wrapper -->
    <div class="app-todos-list">

        <!-- todo list info -->
        <div v-if="hasTodosEntries()" class="todo-list-metadata text-grey">
            <span>Last saved: {{ todos.modified }}</span> <br />
            <span class="text-info" v-html="getTodosTotal() + ' total'"></span>,
            <span class="text-success" v-html="getTodosDone() + ' done'"></span>,
            <span class="text-danger" v-html="getTodosRemain() + ' remain'"></span>.
        </div>

        <!-- empty message if list is empty -->
        <div v-if="hasActiveTodos() && !hasTodosEntries()" class="todo-info-page">
            <p>
                This todos list is empty. <br />
                Type something below and hit enter to add tasks to this todos lists.
            </p>
        </div>

        <!-- todo list items -->
        <ul v-if="hasTodosEntries()" class="todo-list-wrap sortable">
            <li v-for="(task, index) in todos.entries" :id="'item-' + index" class="todo-list-item" :class="{ 'complete': task.complete }" v-sortitem>
                <div class="todo-list-icon is-clickable">
                    <span class="todo-list-icon-pending icon-clock sort-handle"></span>
                    <span class="todo-list-icon-complete icon-check sort-handle"></span>
                </div>
                <div class="todo-list-info">
                    <label class="todo-list-label">
                        <div class="todo-list-date">Last modified: {{ task.modified }}</div>
                        <input
                            class="todo-list-input"
                            type="text"
                            v-model="task.todo"
                            @focus="onFocus( $event )"
                            @keyup.enter="todoTaskSave( $event, index, 1 )"
                            @blur="todoTaskSave( $event, index )" />

                        <span class="todo-list-text text-wrap" v-html="task.todo"></span>
                    </label>
                </div>
                <div class="todo-list-control">
                    <div class="dropdown" v-dropdown>
                        <big class="dropdown-trigger icon-config"></big>
                        <ul class="dropdown-tr">
                            <li v-if="!task.complete"><a class="icon-check icon-pr text-success-hover" href="#" @click.prevent="todoTaskCheck( $event, index )">Check</a></li>
                            <li v-if="task.complete"><a class="icon-clock icon-pr text-warning-hover" href="#" @click.prevent="todoTaskUncheck( $event, index )">Uncheck</a></li>
                            <li><a class="icon-close icon-pr text-danger-hover" href="#" @click.prevent="todoTaskDelete( $event, index )">Delete task</a></li>
                        </ul>
                    </div>
                </div>
            </li>
        </ul>

        <!-- todo list add item form -->
        <form v-if="hasActiveTodos()" class="todo-list-form" action="#" @submit.prevent="todoTaskInsert( $event )">
            <div class="icon-plus icon-pr text-success"></div>
            <input type="text" name="todo" value="" placeholder="Add new TODO task..." />
        </form>

    </div>
</template>


<script>
// dependencies
import Dropdown from "../scripts/Dropdown";
import Sortable from "../scripts/Sortable";

// setup sortable instance
var sortable = new Sortable();

// component
export default {

    // component name
    name: "tasklist",

    // component props
    props: {
        lists: { type: Array, default: [], required: true },
        todos: { type: Object, default: [], required: false },
        options: { type: Object, default: {}, required: false },
    },

    // custom dom element manipulations
    directives: {

        // apply dropdown menu
        dropdown: {
            bind: function( el, binding, vnode ) {
                new Dropdown( el );
            },
        },

        // handle reactive sortable items
        sortitem: {
            bind: function( el, binding, vnode ) {
                sortable.add( el );
            },
            unbind: function( el, binding, vnode ) {
                sortable.remove( el );
            },
        },

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

        onFocus: function( e )
        {
            this.$parent.onFocus( e );
        },

        hasActiveTodos: function()
        {
            return this.$parent.hasActiveTodos();
        },

        hasTodosEntries: function()
        {
            return this.$parent.hasTodosEntries();
        },

        getTodosTotal: function()
        {
            return this.$parent.getTodosTotal();
        },

        getTodosDone: function()
        {
            return this.$parent.getTodosDone();
        },

        getTodosRemain: function()
        {
            return this.$parent.getTodosRemain();
        },

        // append new todos task to current active todos list (form submit event)
        todoTaskInsert: function( e )
        {
            if( e && e.target && this.hasActiveTodos() )
            {
                e.preventDefault();

                var entry = {
                    todo     : e.target.todo.value || "",
                    modified : this.$parent.getDateString(),
                    complete : false,
                };
                if( entry.todo )
                {
                    this.todos.entries.push( entry );
                    this.$parent.saveData( "New list task has been added." );
                }
                e.target.reset();
            }
        },

        // save individual todo list entry task name
        todoTaskSave: function( e, index, enter )
        {
            var todo = e.target.value || "";

            if( enter ) { e.target.blur(); return; }

            if( this.hasActiveTodos() && todo && todo !== this.last && index !== undefined )
            {
                this.todos.entries[ index ].todo = todo;
                this.todos.entries[ index ].modified = this.$parent.getDateString();
                this.$parent.saveData( "List todo task has been updated." );
            }
            e.target.blur();
        },

        // make todos task as checked for index
        todoTaskCheck: function( e, index )
        {
            if( this.hasActiveTodos() && index !== undefined )
            {
                this.todos.entries[ index ].complete = true;
                this.todos.entries[ index ].modified = this.$parent.getDateString();
                this.$parent.saveData( "Todo task has been marked as complete." );
            }
        },

        // make todos task as unchecked for index
        todoTaskUncheck: function( e, index )
        {
            if( this.hasActiveTodos() && index !== undefined )
            {
                this.todos.entries[ index ].complete = false;
                this.todos.entries[ index ].modified = this.$parent.getDateString();
                this.$parent.saveData( "Todo task has been marked as pending." );
            }
        },

        // delete todos task from list for index
        todoTaskDelete: function( e, index )
        {
            if( this.hasActiveTodos() && index !== undefined )
            {
                this.todos.entries.splice( index, 1 );
                this.$parent.saveData( "Todo task has been removed from the list." );
            }
        },

        // reset sortable container when component mounts/updates
        setupSortable: function()
        {
            var list = document.querySelector( ".todo-list-wrap" );
            sortable.setContainer( list );
        },
    },

    // setup sortable change handler
    beforeMount: function()
    {
        var self = this;

        sortable.onChange( function()
        {
            var indexes = this.getNumericOrder();
            self.$parent.sortTodos( indexes );
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
