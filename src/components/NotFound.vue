<template>
    <div class="todo-info-page">

        <h4>Page Not Found</h4>

        <div class="push-bottom">
            Oops, looks like nothing was found for the current URL route specified.
            Maybe the thing that was here before got deleted, or the URL might be incorrect.
            Double-check and try again, or click around to go somewhere else.
            <span class="icon-link icon-pr text-danger" v-html="getUrl()"></span>
        </div>

        <hr />
        <a class="btn bg-bright-hover icon-home icon-pr shadow-paper" href="#/home">App home</a>
        <a class="btn bg-bright-hover icon-reload icon-pr shadow-paper" href="#" @click.prevent="reload()">Try again</a>

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
        emit: function() {
            return this.$parent.emit.apply( this.$parent, arguments );
        },

        // get current address
        getUrl: function() {
            return location.href || "";
        },

        // reload the page
        reload: function() {
            location.reload();
        },

    }
};
</script>
