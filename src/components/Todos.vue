
<template>
    <div class="app-todos-list">

        <ul v-if="countTotal()" class="todo-list-wrap sortable">
            <li v-for="(task, index) in todos.tasks" :id="'task-' + index" :key="task.key" class="todo-list-item" :class="{ 'complete': task.complete }" v-sortitem>
                <div class="todo-list-icon is-clickable">
                    <span class="todo-list-icon-pending fa fa-clock sort-handle fx fx-drop-in"></span>
                    <span class="todo-list-icon-complete fa fa-check sort-handle fx fx-drop-in"></span>
                </div>
                <div class="todo-list-info">
                    <label class="todo-list-label">
                        <div class="todo-list-date" v-html="task.modified"></div>
                        <input class="todo-list-input" type="text" v-model="task.todo" @focus="onFocus( $event )" @keyup.enter="taskUpdate( $event, index, 1 )" @blur="taskUpdate( $event, index )" />
                        <span class="todo-list-text text-wrap"><span>{{task.todo}}</span> <i class="fa fa-pen"></i></span>
                    </label>
                </div>
                <div class="todo-list-control">
                    <div class="dropdown" v-dropdown>
                        <span class="dropdown-trigger"><i class="fa fa-cog"></i></span>
                        <ul class="dropdown-left dropdown-bottom">
                            <li v-if="!task.complete"><a class="text-success-hover" href="#" @click.prevent="taskCheck( index )"><i class="fa fa-check"></i> Check</a></li>
                            <li v-if="task.complete"><a class="text-warning-hover" href="#" @click.prevent="taskUncheck( index )"><i class="fa fa-clock"></i> Uncheck</a></li>
                            <li><a class="text-danger-hover" href="#" @click.prevent="taskDelete( index )"><i class="fa fa-times"></i>  Delete task</a></li>
                        </ul>
                    </div>
                </div>
            </li>
        </ul>

        <div v-else class="todo-info-page text-centered">
            <h4>This todos list is empty.</h4>
            <p>
                Use the <a href="#" @click.prevent="inputExpand()"><i class="fa fa-plus"></i> New Task</a>
                button below to <b>add new tasks</b> to this list.
            </p>
            <p>
                Use the <a href="#" @click.prevent="emit( 'showMenu' )"><i class="fa fa-bars"></i> Main Menu</a> above
                to <b>manage your tasks</b>, or to <b>delete</b> this list.
            </p>
            <p>
                Use the <a href="#" @click.prevent="emit( 'showSidebar' )"><i class="fa fa-ellipsis-v"></i> Sidebar Panel</a>
                on the right to <b>switch between lists</b>.
            </p>
        </div>

        <div class="todo-footer-wrap">
            <form class="todo-footer-form" action="#" @submit.prevent="taskInsert( $event )">
                <label class="todo-footer-label">
                    <div class="todo-footer-button fa fa-pen" title="New task" @click="inputExpand()" v-tooltip></div>
                    <div class="todo-footer-control" :class="{ 'expanded': expanded }">
                        <input type="text" name="todo" value="" placeholder="Add new task..." autocomplete="off" @blur="inputContract()" />
                    </div>
                </label>
            </form>
        </div>

    </div>
</template>


<script>
// dependencies
import Prompt from "../scripts/Prompt";
import Sortable from "../scripts/Sortable";
import Utils from "../scripts/Utils";
import Scroller from "../scripts/Scroller";

// setup sortable instance
let sortable = new Sortable( null, { uniqueAttribute: "id", moveHorizontal: false } );

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

    // component data
    data: function() {
        return {
            last: "",
            expanded: false,
        };
    },

    // app methods
    methods: {

        // for passing method calls to parent
        emit: function() {
            return this.$parent.emit.apply( this.$parent, arguments );
        },

        // capture previous value of input to compare later when saving
        onFocus: function( e ) {
            this.last = e.target.value || "";
        },

        // scroll tasks area to the bottom
        autoScroll: function() {
            let dest = ( this.options.taskInsertPosition === "top" ) ? "top" : "bottom";
            setTimeout( function() { new Scroller( ".app-left", dest ); }, 500 );
        },

        // expand task input
        inputExpand: function( e ) {
            this.expanded = true;
            this.autoScroll();
        },

        // hide task input
        inputContract: function( e ) {
            this.expanded = false;
        },

        // check if the todos object is valid
        hasTodos: function() {
            return ( this.todos.hasOwnProperty( "key" ) && this.todos.key );
        },

        // check if there are tasks in given todos list
        hasTasks: function() {
            return ( Array.isArray( this.todos.tasks ) && this.todos.tasks.length );
        },

        // count total tasks in current todos
        countTotal: function() {
            return this.hasTasks() ? this.todos.tasks.length : 0;
        },

        // get number of done tasks in a todos list
        countDone: function() {
            return this.hasTasks() ? this.todos.tasks.filter( function( task ){ return task.complete; } ).length : 0;
        },

        // get number of done tasks remaining
        countRemain: function() {
            return this.countTotal() - this.countDone();
        },

        // check if a task exists in the selected todos list
        taskExists: function( index ) {
            return ( this.hasTasks() && typeof this.todos.tasks[ index ] === "object" );
        },

        // append new todos task to current active todos list (form submit event)
        taskInsert: function( e ) {
            e.preventDefault();

            let todo = e.target.todo.value || "";

            if ( this.hasTodos() && todo && typeof todo === "string" ) {
                let task = {
                    key      : Utils.idString(),
                    time     : Date.now(),
                    expire   : 0,
                    modified : Utils.dateString(),
                    todo     : todo,
                    complete : false,
                };
                switch ( this.options.taskInsertPosition ) {
                    case "top" : this.todos.tasks.splice( 0, 0, task ); break;
                    default    : this.todos.tasks.push( task );
                }
                this.emit( "todosUpdate", this.todos, "New todos task has been added." );
                this.autoScroll();
            }
            e.target.reset();
        },

        // save individual todo list entry task name
        taskUpdate: function( e, index, enter ) {
            let todo = e.target.value || "";

            if ( enter ) { e.target.blur(); return; }

            if ( this.hasTodos() && this.taskExists( index ) && todo && todo !== this.last ) {
                let date = Utils.dateString();
                this.todos.tasks[ index ].todo = todo;
                this.todos.tasks[ index ].modified = date;
                this.todos.modified = date;
                this.emit( "todosUpdate", this.todos, "Todos task has been updated." );
            }
        },

        // make todos task as checked for key
        taskCheck: function( index ) {
            if ( this.hasTodos() && this.taskExists( index ) ) {
                let date = Utils.dateString();
                this.todos.tasks[ index ].complete = true;
                this.todos.tasks[ index ].modified = date;
                this.todos.modified = date;
                this.emit( "todosUpdate", this.todos );
            }
        },

        // make todos task as unchecked for key
        taskUncheck: function( index ) {
            if ( this.hasTodos() && this.taskExists( index ) ) {
                let date = Utils.dateString();
                this.todos.tasks[ index ].complete = false;
                this.todos.tasks[ index ].modified = date;
                this.todos.modified = date;
                this.emit( "todosUpdate", this.todos );
            }
        },

        // delete todos task from list for key
        taskDelete: function( index ) {
            if ( this.hasTodos() && this.taskExists( index ) ) {
                let _delete = function() {
                    this.todos.tasks.splice( index, 1 );
                    this.todos.modified = Utils.dateString();
                    this.emit( "todosUpdate", this.todos, "Todos task has been deleted." );
                };
                new Prompt( {
                    title: "Confirm...",
                    confirm: "Delete this task?",
                    onAccept: _delete.bind( this ),
                });
            }
        },

        // remove all completed tasks
        tasksClean: function() {
            if ( this.hasTodos() && this.countDone() > 0 ) {
                let _clean = function() {
                    this.todos.tasks = this.todos.tasks.filter( function( task ) { return !task.complete; } );
                    this.todos.modified = Utils.dateString();
                    this.emit( "todosUpdate", this.todos, "All completed tasks have been removed." );
                };
                new Prompt( {
                    title: "Confirm...",
                    confirm: "Remove all complete tasks?",
                    onAccept: _clean.bind( this ),
                });
            }
        },

        // remove all tasks
        tasksFlush: function() {
            if ( this.hasTodos() && this.countTotal() > 0 ) {
                let _flush = function() {
                    this.todos.tasks = [];
                    this.todos.modified = Utils.dateString();
                    this.emit( "todosUpdate", this.todos, "All tasks have been removed." );
                };
                new Prompt( {
                    title: "Confirm...",
                    confirm: "Delete all tasks?",
                    onAccept: _flush.bind( this ),
                });
            }
        },

        // check/uncheck all tasks in active list
        tasksToggle: function( status ) {
            if ( this.hasTodos() && typeof status === "boolean" ) {
                if ( status === true && this.countRemain() === 0 ) return;
                if ( status === false && this.countRemain() === this.countTotal() ) return;

                let date = Utils.dateString();
                let word = status ? "checked" : "unchecked";

                for ( let i = 0; i < this.todos.tasks.length; ++i ) {
                    this.todos.tasks[ i ].modified = date;
                    this.todos.tasks[ i ].complete = status;
                }
                this.todos.modified = date;
                this.emit( "todosUpdate", this.todos, "All tasks have been " + word + "." );
            }
        },

        // save new order of todo tasks
        tasksSort: function( indexes ) {
            if ( this.hasTasks() && Array.isArray( indexes ) ) {
                if ( indexes.length === this.todos.tasks.length ) {
                    let tasks = []; // fresh list

                    for ( let i = 0; i < indexes.length; ++i ) {
                        tasks[ i ] = Object.assign( {}, this.todos.tasks[ indexes[ i ] ] );
                    }
                    this.todos.tasks = tasks;
                    this.todos.modified = Utils.dateString();
                    this.emit( "todosUpdate", this.todos );
                }
            }
        },

        // reset sortable container when component mounts/updates
        setupSortable: function() {
            let list = document.querySelector( ".todo-list-wrap" );
            sortable.setContainer( list );
        },
    },

    // setup sortable change handler
    beforeMount: function() {
        let self = this;

        // register methods that need to be called from outside
        this.$parent.$on( "tasksToggle", this.tasksToggle );
        this.$parent.$on( "tasksClean", this.tasksClean );
        this.$parent.$on( "tasksFlush", this.tasksFlush );

        // setup handle for sort order cange
        sortable.onChange( function() {
            self.tasksSort( this.getNumericOrder() );
        });
    },

    // component before destroy
    beforeDestroy: function() {
        this.$parent.$off( "tasksToggle" );
        this.$parent.$off( "tasksClean" );
        this.$parent.$off( "tasksFlush" );
    },

    // component mounted
    mounted: function() {
        this.setupSortable();
    },

    // component updated
    updated: function() {
        this.setupSortable();
    },
}
</script>
