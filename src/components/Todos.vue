
<template>
    <div class="app-todos-list">

        <div v-if="!hasTasks()" class="todo-info-page">
            <h4>
                This todos list is empty.
            </h4>
            <p>
                <b>Type something</b> below and <b>hit enter</b> to add new tasks to this lists.
            </p>
            <p>
                Use the <a class="icon-menu icon-pr" href="#" @click.prevent="emit( 'showMenu' )">Main Menu</a> above
                to <b>manage your tasks</b>, or to <b>delete</b> this list.
            </p>
        </div>

        <ul v-if="hasTasks()" class="todo-list-wrap sortable">
            <li v-for="(task, index) in todos.tasks" :id="'task-' + index" :key="task.id" class="todo-list-item" :class="{ 'complete': task.complete }" v-sortitem>
                <div class="todo-list-icon is-clickable">
                    <span class="todo-list-icon-pending icon-clock sort-handle"></span>
                    <span class="todo-list-icon-complete icon-check sort-handle"></span>
                </div>
                <div class="todo-list-info">
                    <label class="todo-list-label">
                        <div class="todo-list-date">Last modified: {{ task.modified }}</div>
                        <input class="todo-list-input" type="text" v-model="task.todo" @focus="onFocus( $event )" @keyup.enter="taskUpdate( $event, index, 1 )" @blur="taskUpdate( $event, index )" />
                        <span class="todo-list-text text-wrap" v-html="task.todo"></span>
                    </label>
                </div>
                <div class="todo-list-control">
                    <div class="dropdown" v-dropdown>
                        <big class="dropdown-trigger icon-config"></big>
                        <ul class="dropdown-tr">
                            <li v-if="!task.complete"><a class="icon-check icon-pr text-success-hover" href="#" @click.prevent="taskCheck( index )">Check</a></li>
                            <li v-if="task.complete"><a class="icon-clock icon-pr text-warning-hover" href="#" @click.prevent="taskUncheck( index )">Uncheck</a></li>
                            <li><a class="icon-close icon-pr text-danger-hover" href="#" @click.prevent="taskDelete( index )">Delete task</a></li>
                        </ul>
                    </div>
                </div>
            </li>
        </ul>

        <div class="todo-list-footer">
            <form class="todo-list-form" action="#" @submit.prevent="taskInsert( $event )">
                <div class="icon-plus text-success"></div>
                <input type="text" name="todo" value="" placeholder="Add new TODO task..." />
            </form>
            <div class="todo-list-metadata" v-if="todos.modified">
                <span class="icon-clock icon-pr">Last saved: {{ todos.modified }}</span> <br /> &nbsp;&nbsp;&nbsp;
                <span class="text-info" v-html="countTotal() + ' total'"></span>,
                <span class="text-success" v-html="countDone() + ' done'"></span>,
                <span class="text-danger" v-html="countRemain() + ' remain'"></span>.
            </div>
        </div>

    </div>
</template>


<script>
// dependencies
import Prompt from "../scripts/Prompt";
import Sortable from "../scripts/Sortable";
import Utils from "../scripts/Utils";

// setup sortable instance
var sortable = new Sortable();

// component
export default {

    // component props
    props: {
        todos: { type: Object, default: {}, required: true },
        options: { type: Object, default: {}, required: false },
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

    // component data
    data: function() {
        return {
            last: "",
        };
    },

    // app methods
    methods: {

        // for passing method calls to parent
        emit: function()
        {
            return this.$parent.emit.apply( this.$parent, arguments );
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

        // check if there are tasks in selected todos list
        hasTasks: function()
        {
            return ( Array.isArray( this.todos.tasks ) && this.todos.tasks.length );
        },

        // get total number of entries in a todos list
        countTotal: function()
        {
            return this.hasTasks() ? this.todos.tasks.length : 0;
        },

        // get number of done tasks in a todos list
        countDone: function()
        {
            return this.hasTasks() ? this.todos.tasks.filter( function( task ){ return task.complete; } ).length : 0;
        },

        // get number of done tasks remaining
        countRemain: function()
        {
            return this.countTotal() - this.countDone();
        },

        // check if a task exists in the selected todos list
        taskExists: function( index )
        {
            if( Array.isArray( this.todos.tasks ) && index !== undefined )
            {
                if( this.todos.tasks[ index ] !== undefined )
                {
                    return true;
                }
            }
            return false;
        },

        // append new todos task to current active todos list (form submit event)
        taskInsert: function( e )
        {
            e.preventDefault();

            var todo = e.target.todo.value || "";

            if( this.hasTodos() && todo && typeof todo === "string" )
            {
                var id   = Utils.randString( 10 );
                var date = Utils.dateString();
                var task = {
                    id       : id,
                    todo     : todo,
                    modified : date,
                    complete : false,
                };
                switch( this.options.taskInsertPosition )
                {
                    case "top" : this.todos.tasks.splice( 0, 0, task ) ; break;
                    default    : this.todos.tasks.push( task );
                }
                this.todos.modified = date;
                this.emit( "todosSave", this.todos, "New todos task has been added." );
            }
            e.target.reset();
        },

        // save individual todo list entry task name
        taskUpdate: function( e, index, enter )
        {
            var todo = e.target.value || "";

            if( enter ) { e.target.blur(); return; }

            if( this.taskExists( index ) && todo && todo !== this.last )
            {
                var date = Utils.dateString();
                this.todos.modified = date;
                this.todos.tasks[ index ].modified = date;
                this.todos.tasks[ index ].todo = todo;
                this.emit( "todosSave", this.todos, "Todos task has been updated." );
            }
        },

        // make todos task as checked for index
        taskCheck: function( index )
        {
            if( this.taskExists( index ) )
            {
                var date = Utils.dateString();
                this.todos.modified = date;
                this.todos.tasks[ index ].modified = date;
                this.todos.tasks[ index ].complete = true;
                this.emit( "todosSave", this.todos, "Todos task has been marked as complete." );
            }
        },

        // make todos task as unchecked for index
        taskUncheck: function( index )
        {
            if( this.taskExists( index ) )
            {
                var date = Utils.dateString();
                this.todos.modified = date;
                this.todos.tasks[ index ].modified = date;
                this.todos.tasks[ index ].complete = false;
                this.emit( "todosSave", this.todos, "Todos task has been unchecked." );
            }
        },

        // delete todos task from list for index
        taskDelete: function( index )
        {
            if( this.taskExists( index ) )
            {
                this.todos.modified = Utils.dateString();
                this.todos.tasks.splice( index, 1 );
                this.emit( "todosSave", this.todos, "Todos task has been deleted." );
            }
        },

        // remove all completed tasks
        tasksClean: function()
        {
            if( this.hasTodos() && this.countDone() > 0 )
            {
                var self = this;

                new Prompt({
                    title: "Confirm...",
                    confirm: "Delete all completed tasks?",
                    onAccept: function()
                    {
                        self.todos.modified = Utils.dateString();
                        self.todos.tasks = self.todos.tasks.filter( function( task ) { return !task.complete; } );
                        self.emit( "todosSave", self.todos, "All completed tasks have been removed" );
                    }
                });
            }
        },

        // remove all tasks
        tasksFlush: function()
        {
            if( this.hasTodos() && this.countTotal() > 0 )
            {
                var self = this;

                new Prompt({
                    title: "Confirm...",
                    confirm: "Delete all tasks from this list?",
                    onAccept: function()
                    {
                        self.todos.modified = Utils.dateString();
                        self.todos.tasks = [];
                        self.emit( "todosSave", self.todos, "All tasks have been removed" );
                    }
                });
            }
        },

        // check/uncheck all tasks in active list
        tasksToggle: function( status )
        {
            if( this.hasTodos() && typeof status === "boolean" )
            {
                if( status === true && this.countRemain() === 0 ) return;
                if( status === false && this.countRemain() === this.countTotal() ) return;

                var date = Utils.dateString();

                for( var i = 0; i < this.todos.tasks.length; ++i )
                {
                    this.todos.tasks[ i ].modified = date;
                    this.todos.tasks[ i ].complete = status;
                }
                this.todos.modified = date;
                this.emit( "todosSave", this.todos, "All tasks have been " + ( status ? "checked" : "unchecked" ) + "." );
            }
        },

        // save new order of todo tasks
        tasksSort: function( indexes )
        {
            if( this.hasTasks() && Array.isArray( indexes ) )
            {
                if( indexes.length === this.todos.tasks.length )
                {
                    var tasks = []; // fresh list

                    for( var i = 0; i < indexes.length; ++i )
                    {
                        tasks[ i ] = Object.assign( {}, this.todos.tasks[ indexes[ i ] ] );
                    }
                    this.todos.tasks = tasks;
                    this.todos.modified = Utils.dateString();
                    this.emit( "todosSave", this.todos, "New task list order has been saved." );
                }
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

        // register methods that need to be called from outside
        this.$parent.$on( "tasksToggle", this.tasksToggle );
        this.$parent.$on( "tasksClean", this.tasksClean );
        this.$parent.$on( "tasksFlush", this.tasksFlush );

        // setup handle for sort order cange
        sortable.onChange( function() {
            self.tasksSort( this.getNumericOrder() );
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
