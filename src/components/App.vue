<template>
    <!-- app main wrapper -->
    <div class="app-wrap">

        <!-- main todo area -->
        <div class="app-left">

            <!-- todo list heading -->
            <div class="heading-wrap flex-row flex-space flex-middle">
                <div class="icon-list icon-pr"></div>
                <div class="flex-1">
                    <input
                        type="text"
                        name="listName"
                        placeholder="New todo list name..."
                        autocomplete="off"
                        v-model="todos.name"
                        @focus="onFocus( $event )"
                        @keyup.enter="todoListSave( $event, 1 )"
                        @blur="todoListSave( $event )" />
                </div>
                <div class="pad-left">
                    <button
                        v-if="hasActiveTodo()"
                        class="is-clickable icon-x text-grey-hover"
                        title="Delete list"
                        @click="todoListDelete( $event )"
                        v-tooltip>
                    </button>
                </div>
            </div>

            <!-- todo list items -->
            <ul v-if="hasActiveTodo()" class="todo-list-wrap">
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
            <form v-if="hasActiveTodo()" class="todo-list-form" action="#" @submit.prevent="todoTaskInsert( $event )">
                <div class="flex-row flex-middle">
                    <div class="icon-plus icon-pr"></div>
                    <div class="flex-1">
                        <input type="text" name="todo" value="" placeholder="Add new TODO task..." />
                    </div>
                </div>
            </form>

            <!-- show welcome info when nothing is selected -->
            <div v-if="!hasActiveTodo()" class="todo-welcome">
                <p>
                    This is a simple TODO lists and task manager application.
                    Right now there's nothing selected, so you can either select a saved list
                    from the right if you've been here before, or type in a name above
                    to create a new list.
                </p>
            </div>

        </div>

        <!-- right sidebar -->
        <div class="app-right">

            <!-- saved lists heading -->
            <div class="heading-wrap flex-row fles-space flex-middle">
                <div class="icon-folder icon-pr">Saved Lists</div>
            </div>

            <!-- saved lists items -->
            <div class="saved-list-wrap">
                <ul class="saved-list-container">
                    <li v-for="(todos, index) in lists" class="saved-list-item" :class="{ 'active': isActiveList( index ) }">
                        <a class="saved-list-title icon-list icon-pr" href="#" title="Manage" @click.prevent="selectTodos( index )" v-html="todos.name" v-tooltip></a> <hr />
                        <span class="saved-list-pill saved-list-total" v-html="getTodosTotal( todos ) + ' total'"></span>
                        <span class="saved-list-pill saved-list-done" v-html="getTodosDone( todos ) + ' done'"></span>
                    </li>
                </ul>
                <a class="btn bg-success-hover icon-plus icon-pr shadow-paper" href="#" @click.prevent="createNewTodos()">New List</a>
            </div>

        </div>

    </div>
</template>

<script>
/**
 * Setup global tooltips handler
 */
import Tooltip from "../scripts/Tooltip";
var tooltip = new Tooltip();

/**
 * App component
 */
export default {

    // component name
    name: "app",

    // app data
    data() {
        return {
            key: "todo_app_data",
            lists: [],
            todos: {},
            index: -1,
            last: "",
        }
    },

    // custom dom element manipulations
    directives: {

        // apply tooltip text
        tooltip: {
            bind: function( el ) {
                tooltip.select( el );
            },
            unbind: function( el ) {
                tooltip.unselect( el );
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

        // catch input event to change list name
        todoListSave: function( e, enter )
        {
            var name = e.target.value || ""; // input value

            if( enter ) // release focus on enter press
            {
                e.target.blur();
                return;
            }
            if( name && name !== this.last ) // value has changed
            {
                if( this.hasActiveTodo() ) // edit mode
                {
                    this.lists[ this.index ].name = name;
                    this.lists[ this.index ].modified = this.getDateString();
                }
                else { // create new entry and select it
                    this.lists.push( this.getNewListEntry( name ) );
                    this.selectTodos( this.lists.length - 1 );
                }
                this.saveData();
            }
            e.target.blur();
        },

        // delete currently active todos (btn event)
        todoListDelete: function( e )
        {
            if( this.hasActiveTodo() && confirm( "Delete this list?" ) )
            {
                this.lists.splice( this.index, 1 );
                this.index = -1;
                this.todos = this.getNewListEntry();
                this.saveData();
            }
        },

        // append new todos task to current active todos list (form submit event)
        todoTaskInsert: function( e )
        {
            if( e && e.target && this.hasActiveTodo() )
            {
                e.preventDefault();

                var todo = e.target.todo.value || "";

                if( todo )
                {
                    this.lists[ this.index ].entries.push({
                        todo: todo,
                        modified: this.getDateString(),
                        complete: false,
                    });
                    this.selectTodos( this.index );
                    this.saveData();
                }
                e.target.reset();
            }
        },

        // save individual todo list entry task name
        todoTaskSave: function( e, index, enter )
        {
            var todo = e.target.value || ""; // input value

            if( enter ) // release focus on enter press
            {
                e.target.blur();
                return;
            }
            if( this.hasActiveTodo() && todo && todo !== this.last && index !== undefined )
            {
                this.lists[ this.index ].entries[ index ].todo = todo;
                this.lists[ this.index ].entries[ index ].modified = this.getDateString();
                this.saveData();
            }
            e.target.blur();
        },

        // make todos task as done for index
        todoTaskDone: function( e, index )
        {
            if( this.hasActiveTodo() && index !== undefined )
            {
                this.lists[ this.index ].entries[ index ].complete = true;
                this.lists[ this.index ].entries[ index ].modified = this.getDateString();
                this.saveData();
            }
        },

        // delete todos task from list for index
        todoTaskDelete: function( e, index )
        {
            if( this.hasActiveTodo() && confirm( "Delete this task?" ) && index !== undefined )
            {
                this.lists[ this.index ].entries.splice( index, 1 );
                this.saveData();
            }
        },

        // select a todos list to be active from sidebar
        selectTodos: function( index )
        {
            if( this.lists[ index ] !== undefined )
            {
                this.index = index;
                this.todos = this.lists[ index ];
            }
        },

        // clear active for creation of a new todos list
        createNewTodos: function()
        {
            var name = "Todo on " + this.getDateString();
            this.lists.push( this.getNewListEntry( name ) );
            this.selectTodos( this.lists.length - 1 );
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

        // get object for a new todos list
        getNewListEntry: function( name )
        {
            return {
                name: name || "",
                modified: this.getDateString(),
                entries: [],
            };
        },

        // get current date string
        getDateString: function()
        {
            var date  = new Date(),
                year  = date.getUTCFullYear(),
                month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][ date.getMonth() ],
                day   = date.getUTCDate();

            return month + " " + day + " " + year;
        },

        // check if there an active todo list selected
        hasActiveTodo: function()
        {
            return ( this.index >= 0 ) ? true : false;
        },

        // check if sidebar is is current selected list
        isActiveList: function( index )
        {
            return ( index === this.index ) ? true : false;
        },

        // load saved data from store
        loadData: function()
        {
            try
            {
                console.log( "Loading app data...", Date.now() );

                var json = localStorage.getItem( this.key ) || "[]",
                    data = JSON.parse( json );

                this.lists = data || [];
                return true;
            }
            catch( e ) { console.log( e ); }
            return false;
        },

        // save local data to store
        saveData: function()
        {
            try
            {
                console.log( "Saving app data...", Date.now() );

                var json = JSON.stringify( this.lists );
                localStorage.setItem( this.key, json );
                return true;
            }
            catch( e ) { console.log( e ); }
            return false;
        },
    },

    // before component mounted
    beforeMount: function()
    {
        this.loadData();
    },

    // component mounted
    mounted: function()
    {

    },
}
</script>

<style lang="scss">
@charset "utf-8";
@import "../scss/variables";
@import "../scss/reset";
@import "../scss/fontello";
@import "../scss/type";
@import "../scss/buttons";
@import "../scss/links";
@import "../scss/flexbox";
@import "../scss/forms";
@import "../scss/shadows";
@import "../scss/utils";
@import "../scss/tooltip";
@import "../scss/modifiers";
@import "../scss/app";
</style>