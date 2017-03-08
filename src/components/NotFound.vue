<template>
    <div class="todo-info-page">
        <h4>Page Not Found</h4>
        <p>
            Oops, looks like nothing was found for the current URL route specified.
            Maybe whatever was here before got deleted, or the URL route might be incorrect.
            Double-check and try again, or click around to go somewhere else. &nbsp;
            <span class="icon-link text-danger" v-html="curUrl()"></span>
        </p>
        <hr />
        <p>
            <button class="btn bg-bright-hover icon-home icon-pr shadow-paper" @click="goHome()">App home</button>
            <button class="btn bg-bright-hover icon-reload icon-pr shadow-paper" @click="tryAgain()">Try again</button>
        </p>
    </div>
</template>


<script>
// component
export default {

    // component name
    name: "notfound",

    // component data
    data() {
        return {

        }
    },

    // component methods
    methods: {

        // get current address
        curUrl: function()
        {
            return location.href || "";
        },

        // reload the page
        tryAgain: function()
        {
            location.reload();
        },

        // go to home view
        goHome: function()
        {
            this.$parent.unselectTodos();
        },

    }
};
</script>
