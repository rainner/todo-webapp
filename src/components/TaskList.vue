
<template>
    <!-- component wrapper -->
    <div class="app-todos-list">

        <!-- todo list heading -->
        <div class="heading-wrap flex-row flex-space flex-middle">
            <div>
                <span class="icon-list icon-pr"></span>
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
                <button
                    v-if="hasActiveTodos()"
                    class="is-clickable icon-home text-grey-hover"
                    title="App home"
                    @click="clearTodos( $event )"
                    v-tooltip>
                </button>

                <button
                    v-if="hasActiveTodos()"
                    class="is-clickable icon-x text-grey-hover"
                    title="Delete list"
                    @click="todoListDelete( $event )"
                    v-tooltip>
                </button>
            </div>
        </div>

        <!-- no todos list selected, show welcome message -->
        <welcome v-if="!hasActiveTodos()"></welcome>

        <!-- current todos list has no entries, show empty message -->
        <empty v-if="hasActiveTodos() && !hasTodosEntries()"></empty>

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

                        <span class="todo-list-text" v-html="task.todo"></span>
                    </label>
                </div>
                <div class="todo-list-control">
                    <button class="todo-list-btn-check icon-check text-success-hover" title="Mark complete" @click="todoTaskDone( $event, index )" v-tooltip></button>
                    <button class="todo-list-btn-delete icon-x text-danger-hover" title="Delete task" @click="todoTaskDelete( $event, index )" v-tooltip></button>
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

        // clear selected todos
        clearTodos: function()
        {
            this.$parent.unselectTodos();
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

        // make todos task as done for index
        todoTaskDone: function( e, index )
        {
            if( this.hasActiveTodos() && index !== undefined )
            {
                this.todos.entries[ index ].complete = true;
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
    },
}
</script>
