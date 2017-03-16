
<template>
    <div class="todo-info-page text">

        <h3>Hello and Welcome</h3>
        <p>
            This is a simple web application for creating and managing TODO lists.
        </p>
        <p>
            To get started, you first need to create a
            <a class="icon-plus icon-pr" href="#" @click.prevent="emit( 'todosCreate' )">New List</a>,
            or select one you already created from the
            <a class="icon-book icon-pr" href="#" @click.prevent="emit( 'showSidebar' )">Sidebar Panel</a>
            to the right <i>(hidden on mobile)</i>.
        </p>
        <p>
            You can find more information about how to use this application along with
            other technical and author details by looking at the
            <a class="icon-code icon-pr" href="#/about">About this app</a> page.
        </p>
        <p>
            To manage options for this application, or to authenticate using an external
            account to keep your data sync'd on a remote database, have a look at the
            <a class="icon-user icon-pr" href="#/options">Account &amp; options</a> page.
        </p>

        <hr />
        <h4>Share this app</h4>
        <div>
            <button class="btn bg-bright-hover icon-twitter icon-pr shadow-paper" @click="share( 'twitter' )">Twitter</button>
            <button class="btn bg-bright-hover icon-facebook icon-pr shadow-paper" @click="share( 'facebook' )">Facebook</button>
            <button class="btn bg-bright-hover icon-reddit icon-pr shadow-paper" @click="share( 'reddit' )">Reddit</button>
        </div>

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

    // component methods
    methods: {

        // for passing method calls to parent
        emit: function()
        {
            return this.$parent.emit.apply( this.$parent, arguments );
        },

        // launch share window
        share: function( service )
        {
            var url    = window.location.href || "";
            var title  = "Todos web application";
            var status = "Todos web application by @raintek_ #webdev #javascript #vuejs | " + url;

            switch( service )
            {
                case "twitter":
                    return window.open( "//twitter.com/home?status="+ encodeURIComponent( status ), "_blank" );

                case "facebook":
                    return window.open( "//facebook.com/sharer/sharer.php?u="+ encodeURIComponent( url ) + "&t=" + encodeURIComponent( title ), "_blank" );

                case "reddit":
                    return window.open( "//reddit.com/submit?url="+ encodeURIComponent( url ) + "&title=" + encodeURIComponent( title ), "_blank" );
            }
        },

    }
};
</script>
