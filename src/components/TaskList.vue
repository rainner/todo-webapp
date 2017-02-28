
<template>
    <!-- component wrapper -->
    <div class="app-todos-list">

        <!-- todo list heading -->
        <div class="heading-wrap flex-row flex-space flex-middle">

            <div>
                <span class="icon-calendar icon-pr"></span>
            </div>

            <div class="flex-1">
                <input
                    type="text"
                    name="listName"
                    placeholder="New todos list name..."
                    autocomplete="off"
                    v-model="todos.name"
                    @focus="onFocus( $event )"
                    @keyup.enter="todoListSave( $event, 1 )"
                    @blur="todoListSave( $event )" />
            </div>

            <div class="pad-left">
                <div class="dropdown" v-dropdown>
                    <big class="dropdown-trigger icon-menu text-grey-hover"></big>
                    <ul class="dropdown-tr">
                        <li>
                            <a href="#"
                                class="is-clickable icon-home"
                                @click.prevent="clearTodos( $event )">
                                App home
                            </a>
                        </li>
                        <li>
                            <a href="#"
                                class="is-clickable icon-reload"
                                @click.prevent="reloadPage()">
                                Reload app
                            </a>
                        </li>
                        <li id="sidebar-toggle-btn">
                            <a href="#"
                                class="is-clickable icon-folder"
                                @click.prevent="showSidebar( $event )">
                                Saved lists
                            </a>
                        </li>
                        <li v-if="hasActiveTodos()">
                            <a href="#"
                                class="is-clickable icon-x text-danger-hover"
                                @click.prevent="todoListDelete( $event )">
                                Delete list
                            </a>
                        </li>
                        <li>
                            <a href="#"
                                class="is-clickable icon-trash text-danger-hover"
                                @click.prevent="flushData( $event )">
                                Flush data
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

        </div>

        <!-- no todos list selected, show welcome message -->
        <welcome v-if="!hasActiveTodos()"></welcome>

        <!-- current todos list has no entries, show empty message -->
        <empty v-if="hasActiveTodos() && !hasTodosEntries()"></empty>

         <!-- todo list info -->
        <div v-if="hasTodosEntries()" class="todo-list-metadata text-grey">
            <span>Last saved: {{ todos.modified }}</span> <br />
            <span class="text-warning" v-html="getTodosTotal() + ' total'"></span>,
            <span class="text-success" v-html="getTodosDone() + ' done'"></span>
        </div>

        <!-- todo list items -->
        <ul v-if="hasTodosEntries()" class="todo-list-wrap">
            <li v-for="(task, index) in todos.entries" class="todo-list-item" :class="{ 'complete': task.complete }">
                <div class="todo-list-icon">
                    <span class="todo-list-icon-pending icon-clock"></span>
                    <span class="todo-list-icon-complete icon-check"></span>
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
            <div class="flex-row flex-middle">
                <div class="icon-plus icon-pr"></div>
                <div class="flex-1">
                    <input type="text" name="todo" value="" placeholder="Add new TODO task..." autofocus />
                </div>
            </div>
        </form>

    </div>
</template>

<script>
// imports
import Welcome from "./Welcome.vue";
import Empty from "./Empty.vue";
import Dropdown from "../scripts/Dropdown";

/**
 * Task list component
 */
export default {

    // component name
    name: "tasklist",

    // sub components
    components: {
        "welcome": Welcome,
        "empty": Empty,
    },

    // component props
    props: {
        todos: { type: Object, default: {}, required: true },
    },

    // component data
    data() {
        return {
            last: "",
        }
    },

    // custom dom element manipulations
    directives: {

        // apply dropdown menu
        dropdown: {
            bind: function( el, binding, vnode ) {
                new Dropdown( el );
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

        // capture previous value of something to compare later when saving
        onFocus: function( e )
        {
            this.last = e.target.value || "";
        },

        // reload the page
        reloadPage: function()
        {
            top.location.reload();
        },

        // show sidebar on click
        showSidebar: function( e )
        {
            this.$parent.showSidebar();
        },

        // clear selected todos
        clearTodos: function()
        {
            this.$parent.unselectTodos();
        },

        // flush all stored app data and reset
        flushData: function()
        {
            this.$parent.flushData();
        },

        // add new todos-list to the list and select it
        createTodos: function( name )
        {
            this.$parent.createTodos( name );
        },

        // check if there is an active todos present
        hasActiveTodos: function()
        {
            if( !this.todos ) return false;
            if( !this.todos.name ) return false;
            if( !this.todos.hasOwnProperty( "entries" ) ) return false;
            return true;
        },

        // check if current todos has entries
        hasTodosEntries: function()
        {
            return ( this.hasActiveTodos() && this.todos.entries.length ) ? true : false;
        },

        // catch input event to change list name
        todoListSave: function( e, enter )
        {
            var name = e.target.value || "";

            if( enter ) { e.target.blur(); return; }

            if( name && name !== this.last )
            {
                if( this.hasActiveTodos() )
                {
                    this.todos.name = name;
                    this.$parent.updateTodos( this.todos );
                } else {
                    this.createTodos( name );
                }
            }
        },

        // delete currently active todos (btn event)
        todoListDelete: function( e )
        {
            this.$parent.deleteTodos();
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
                    this.$parent.updateTodos( this.todos );
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
                this.$parent.updateTodos( this.todos );
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
                this.$parent.updateTodos( this.todos );
            }
        },

        // make todos task as unchecked for index
        todoTaskUncheck: function( e, index )
        {
            if( this.hasActiveTodos() && index !== undefined )
            {
                this.todos.entries[ index ].complete = false;
                this.todos.entries[ index ].modified = this.$parent.getDateString();
                this.$parent.updateTodos( this.todos );
            }
        },

        // delete todos task from list for index
        todoTaskDelete: function( e, index )
        {
            if( this.hasActiveTodos() && index !== undefined )
            {
                this.todos.entries.splice( index, 1 );
                this.$parent.updateTodos( this.todos );
            }
        },

        // get total number of entries in a todos list
        getTodosTotal: function()
        {
            return this.$parent.getTodosTotal( this.todos );
        },

        // get number of done tasks in a todos list
        getTodosDone: function()
        {
            return this.$parent.getTodosDone( this.todos );
        },

    },
}
</script>
