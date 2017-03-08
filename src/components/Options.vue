<template>
    <div class="todo-info-page">

        <h4>App Data Management</h4>
        <p>
            This allows you to export the application data in a JSON file format to be saved on your computer.
            You can later import data exported from here to restore the application state if needed.
            You can also trash the app data and start over.
        </p>
        <p>
            <button class="btn bg-success-hover icon-save icon-pr shadow-paper" @click="importData( $event )">Import</button>
            <button class="btn bg-info-hover icon-download icon-pr shadow-paper" @click="exportData( $event )">Export</button>
            <button v-if="lists.length" class="btn bg-danger-hover icon-trash icon-pr shadow-paper" @click="trashData( $event )">Trash All</button>
            <a id="export-link" style="visibility: hidden"></a>
        </p>

        <hr />
        <h4>Remote Authentication</h4>
        <p>
            The data for this app will not be available across browsers or devices, which means you can't take your todos with you.
            If you authenticate using a service, this app will remember you and save your data remotely so you can authenticate from different devices to have access to the same data.
        </p>
        <p>
            <button class="btn bg-bright-hover icon-google icon-pr shadow-paper">Login with Google Account</button>
        </p>

    </div>
</template>


<script>
// dependencies
import Prompt from "../scripts/Prompt";

// component
export default {

    // component name
    name: "options",

    // component props
    props: {
        lists: { type: Array, default: [], required: true },
        todos: { type: Object, default: [], required: false },
        options: { type: Object, default: {}, required: false },
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

        // import data button event
        importData: function( e )
        {
            if( !window.File || !window.FileList || !window.FileReader )
            {
                this.$parent.showNotice( "error", "This browser does not support handling of files." );
                return;
            }
            var self   = this;
            var reader = null;
            var input  = document.createElement( "input" );

            input.setAttribute( "type", "file" );
            input.setAttribute( "accept", ".json" );
            input.addEventListener( "change", function( e )
            {
                if( this.files && this.files.length )
                {
                    if( !/\.json$/i.test( this.files[0].name ) )
                    {
                        self.$parent.showNotice( "warning", "Please select a JSON file." );
                        return;
                    }
                    if( !this.files[0].size )
                    {
                        self.$parent.showNotice( "warning", "The file you selected is empty." );
                        return;
                    }
                    reader = new FileReader();
                    reader.addEventListener( "load", function( e )
                    {
                        // let the parent take it from here
                        self.$parent.importData( e.target.result );
                    });
                    reader.readAsText( this.files[0], "utf-8" );
                }
            });
            document.body.appendChild( input );
            setTimeout( function() { input.click(); }, 100 );
            setTimeout( function() { document.body.removeChild( input ); }, 200 );
        },

        // export data button event
        exportData: function( e )
        {
            try {

                var data = {
                    name: "todos_web_app_data",
                    address: location.href || "",
                    timestamp: Date.now(),
                    date: this.$parent.getDateString(),
                    lists: this.lists,
                    options: this.options,
                };

                var json = JSON.stringify( data );
                var href = "data:application/json;charset=utf-8," + encodeURIComponent( json );
                var link = document.getElementById( "export-link" );

                link.setAttribute( "href", href );
                link.setAttribute( "download", "todos_data.json" );
                link.click();
            }
            catch( e ) {
                console.warn( e );
            }
        },

        // trash data button event
        trashData: function( e )
        {
            this.$parent.flushData();
        },

    },

};
</script>