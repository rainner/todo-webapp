
<template>
    <div class="todo-info-page">

        <h4>About This Application</h4>
        <p>
            This is a <b>simple-to-use</b> web application that lets you <b>create and manage</b> multiple
            <b>TODO lists</b> without having to login or create an account.
        </p>
        <p>
            It uses your web browser's
            built-in <a class="icon-database icon-pr" href="#" @click.prevent="go( 'localforage' )">Storage engine</a>
            by default to store your data, but also allows you to
            <a class="icon-user icon-pr" href="#/options">Authenticate</a>
            using an <b>external account</b> so your data can be <b>saved remotely</b>, allowing
            you to have access to your data from other browsers and devices.
        </p>

        <hr />
        <h4>Creating &amp; Using Lists</h4>
        <p>
            To start working on your TODOs, first you'll need to <b>create a TODOs list</b>.
        </p>
        <p>
            You can do that by <b>typing a name</b> in the <b>top navigation bar</b> and hitting enter to create a new list,
            or you can click the <a class="icon-plus icon-pr" href="#" @click.prevent="emit( 'todosCreate' )">New List</a>
            button at the top navigation bar to add a new list with an automatically generated name.
        </p>
        <p>
            The lists you create will appear on the <a class="icon-book icon-pr" href="#" @click.prevent="emit( 'showSidebar' )">Sidebar Panel</a>
            located to the right. Once a list is <b>created and selected</b>, you can start adding tasks
            using the <b>input field</b> located on the page.
        </p>

        <hr />
        <h4>Managing Lists &amp; Tasks</h4>
        <p>
            When you <b>select a TODO list</b> from the sidebar panel to work on,
            there will be <b>additional options</b> added to the
            <a class="icon-menu icon-pr" href="#" @click.prevent="emit( 'showMenu' )">Main Menu</a>
            located at the <b>top navigation bar</b> for managing the selected list.
        </p>
        <p>
            You should be able to <b>check/uncheck</b> tasks, <b>delete tasks</b>, or <b>delete the list</b> that is currently selected.
            To rename a list or task, <b>click on the name</b> of the list up at the top, or a <b>task entry</b> and start typing.
            When you are done, just <b>hit enter</b> or <b>click anywhere</b> else to <b>save the changes</b>.
        </p>
        <p>
            To <b>sort the tasks</b> for a selected TODO list, <b>click the icon of the task and drag</b> the task to a new position on the list.
            When you let go, the new order will be saved.
        </p>

        <hr />
        <h4>Application Data &amp; Storage</h4>
        <p>
            This application uses <a class="icon-database icon-pr" href="#" @click.prevent="go( 'localforage' )">LocalForage</a>
            to make use of your web browser's built-in storage engine for storing your data, and uses
            <a class="icon-google icon-pr" href="#" @click.prevent="go( 'firebase' )">Google Firebase</a>
            to authenticate users and store data on the cloud for sharing data between devices.
        </p>

        <hr />
        <h4>Technology Stack</h4>
        <p>
            This application was built using <a class="icon-code icon-pr" href="#" @click.prevent="go( 'vuejs' )">Vue JS</a>,
            a progressive framework for building user interfaces, and was bundled for the browser using
            <a class="icon-globe icon-pr" href="#" @click.prevent="go( 'webpack' )">Webpack</a>,
            a module bundler for modern JavaScript applications.
        </p>

        <hr />
        <h4>Source &amp; Author</h4>
        <p>
            You can view and download the source code for this application on the
            <a class="icon-github icon-pr" href="#" @click.prevent="go( 'repo' )">Github Repo</a>.
            Licensed under the <a class="icon-hammer icon-pr" href="#" @click.prevent="go( 'license' )">MIT license</a>.
            Created by <a class="icon-user icon-pr" href="#" @click.prevent="go( 'github' )">{{ author.name }}</a>.
        </p>

    </div>
</template>

<script>
// component
export default {

    // component props
    props: {
        options: { type: Object, default: {}, required: false },
        user: { type: Object, default: {}, required: false },
    },

    // component data
    data() {
        return {
            author: {
                name: "Rainner Lins",
                email: "rainnerlins@gmail.com",
                website: "https://rainnerlins.com/",
                github: "https://github.com/rainner/",
            },
            links: {
                repo: "https://github.com/rainner/todo-webapp/",
                demo: "https://rainner.github.io/todo-webapp/",
                webpack: "https://webpack.js.org/",
                vuejs: "https://vuejs.org/v2/guide/",
                firebase: "https://firebase.google.com/",
                localforage: "https://localforage.github.io/localForage/",
                license: "http://www.opensource.org/licenses/mit-license.php",
            },
        }
    },

    // component methods
    methods: {

        // for passing method calls to parent
        emit: function()
        {
            return this.$parent.emit.apply( this.$parent, arguments );
        },

        // launch link
        go: function( key )
        {
            if( key && typeof key === "string" )
            {
                if( this.author.hasOwnProperty( key ) )
                {
                    window.open( this.author[ key ], "_blank" );
                }
                else if( this.links.hasOwnProperty( key ) )
                {
                    window.open( this.links[ key ], "_blank" );
                }
            }
        },

    }
};
</script>
