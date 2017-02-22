
<template>
    <div class="todo-welcome">
        <p>
            Hello and welcome.
            This is a simple todo lists as tasks manager application.
        </p>
        <hr />
        <p>
            There is nothing selected right now.
            You can get started by typing a name above and hitting enter to create a new list,
            or using the sidebar to the right to select a saved list if you have been here before.
            You can also click the <a class="icon-plus icon-pr" href="#" @click.prevent="createTodos()">New List</a>
            button to create a list with a new name automatically.
        </p>
        <p>
            This application uses the browser's built in storage engine to remember your todos data.
            For more information, visit the <a class="icon-database icon-pr" href="#" @click.prevent="go( 'storage' )">Web Storage API</a>
            info page to learn more.
        </p>
        <p>
            This application was built using <a class="icon-code icon-pr" href="#" @click.prevent="go( 'vue' )">Vue JS</a>,
            a progressive framework for building user interfaces, and was bundled for the browser using
            <a class="icon-globe icon-pr" href="#" @click.prevent="go( 'webpack' )">Webpack</a>,
            a module bundler for modern JavaScript applications.
        </p>
        <hr />
        <p>
            You can view and download the source code for this application on the
            <a class="icon-github icon-pr" href="#" @click.prevent="go( 'repo' )">Github Repo</a>.
            Licensed under the <a class="icon-hammer icon-pr" href="#" @click.prevent="go( 'license' )">MIT license</a>.
            Created by <a class="icon-user icon-pr" href="#" @click.prevent="go( 'author' )">Rainner Lins</a>.
        </p>
    </div>
</template>

<script>
/**
 * Welcome text component
 */
export default {

    // component name
    name: "welcome",

    // component data
    data() {
        return {
            repoLink: "https://github.com/rainner/todo-webapp/",
            demoPageLink: "https://rainner.github.io/todo-webapp/",
            webStorageLink: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API",
            vueJsLink: "https://vuejs.org/v2/guide/",
            webpackLink: "https://webpack.js.org/",
            licenseLink: "http://www.opensource.org/licenses/mit-license.php",
            authorLink: "https://github.com/rainner/",
        }
    },

    // component methods
    methods: {

        // add new todos-list to the list and select it
        createTodos: function( name )
        {
            this.$parent.createTodos( name );
        },

        // launch link
        go: function( key )
        {
            switch( key )
            {
                case "repo"    :  window.open( this.repoLink, "_blank" ); break;
                case "demo"    :  window.open( this.demoPageLink, "_blank" ); break;
                case "storage" :  window.open( this.webStorageLink, "_blank" ); break;
                case "vue"     :  window.open( this.vueJsLink, "_blank" ); break;
                case "webpack" :  window.open( this.webpackLink, "_blank" ); break;
                case "license" :  window.open( this.licenseLink, "_blank" ); break;
                case "author"  :  window.open( this.authorLink, "_blank" ); break;
            }
        },
    }
};
</script>
