<template>
    <div class="todo-info-page">

        <div>
            <h4>Account Sign-in</h4>
            <div v-if="user.provider">
                <div class="user-wrap">
                    <div class="user-photo" :style="'background-image: url('+ user.photo +')'"></div>
                    <div class="user-info">
                        <span>Hello, {{ user.name }}</span><span v-if="user.email"> ({{ user.email }})</span>.
                    </div>
                </div>
                <p>
                    You have authenticated using <span class="text-primary">{{ user.provider }}</span>
                    and are currently logged in. Your todos data will be <b>saved remotely</b> so you can have
                    access to it from <b>other browsers and devices</b>.
                </p>
                <p>
                    <button class="btn bg-secondary-hover shadow-paper text-nowrap" @click="emit( 'userLogoff' )"><i class="fa fa-sign-out-alt"></i> Sign off</button>
                </p>
            </div>
            <div v-else>
                <p>
                    Your app data <b>will not</b> be available <b>across browsers or devices</b>,
                    unless you <b>authenticate</b> using an <b>external service</b> to have your data
                    <b>saved remotely</b> so you can access it from <b>other devices</b> by signing in there as well.
                </p>
                <p>
                    <button class="btn bg-secondary-hover shadow-paper text-nowrap" @click="emit( 'userLogin', 'google' )"><i class="fab fa-google"></i> Google</button>
                    <button class="btn bg-secondary-hover shadow-paper text-nowrap" @click="emit( 'userLogin', 'twitter' )"><i class="fab fa-twitter"></i> Twitter</button>
                    <button class="btn bg-secondary-hover shadow-paper text-nowrap" @click="emit( 'userLogin', 'github' )"><i class="fab fa-github"></i> Github</button>
                </p>
            </div>
        </div>

        <hr />

        <div>
            <h4>Data Management</h4>
            <p>
                Import and export your todos data in <b>JSON format</b>.
                This can be used as a way to <b>backup your data</b>, or take it
                <b>across browsers and devices</b> without having to sign in.
            </p>
            <p>
                <button class="btn bg-secondary-hover shadow-paper text-nowrap" @click="importData()"><i class="fa fa-file-import"></i> Import</button>
                <button class="btn bg-secondary-hover shadow-paper text-nowrap" @click="exportData()"><i class="fa fa-file-export"></i> Export</button>
                <button v-if="hasData()" class="btn bg-danger-hover shadow-paper text-nowrap" @click="flushData()"><i class="fa fa-trash-alt"></i> Erase</button>
            </p>
        </div>

        <hr />

        <div>
            <h4>List Options</h4>

            <div class="form-wrap">

                <div class="form-row">
                    <div class="form-title">Place new tasks on:</div>
                    <div class="form-controls">
                        <label class="form-toggle">
                            <input type="radio" name="taskInsertPosition" value="top" :checked="options.taskInsertPosition == 'top'" @change="onChange( $event )" />
                            <span>Top</span>
                        </label>
                        <label class="form-toggle">
                            <input type="radio" name="taskInsertPosition" value="bottom" :checked="options.taskInsertPosition == 'bottom'" @change="onChange( $event )" />
                            <span>Bottom</span>
                        </label>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-title">Place new lists on:</div>
                    <div class="form-controls">
                        <label class="form-toggle">
                            <input type="radio" name="listInsertPosition" value="top" :checked="options.listInsertPosition == 'top'" @change="onChange( $event )" />
                            <span>Top</span>
                        </label>
                        <label class="form-toggle">
                            <input type="radio" name="listInsertPosition" value="bottom" :checked="options.listInsertPosition == 'bottom'" @change="onChange( $event )" />
                            <span>Bottom</span>
                        </label>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-title">Auto select new lists:</div>
                    <div class="form-controls">
                        <label class="form-toggle">
                            <input type="checkbox" name="listAutoSelect" :checked="options.listAutoSelect" @change="onChange( $event )" />
                            <span>Toggle</span>
                        </label>
                    </div>
                </div>

            </div>

        </div>

    </div>
</template>


<script>
// dependencies
import Prompt from "../scripts/Prompt";
import Utils from "../scripts/Utils";

// component
export default {

    // component props
    props: {
        user: { type: Object, default: {}, required: false },
        options: { type: Object, default: {}, required: false },
        lists: { type: Array, default: [], required: false },
    },

    // app methods
    methods: {

        // for passing method calls to parent
        emit: function() {
            return this.$parent.emit.apply( this.$parent, arguments );
        },

        // check if lists has data
        hasData: function() {
            return this.lists.length || 0;
        },

        // on option toggle change
        onChange: function( e ) {
            let key = e.target.name;
            let val = e.target.value;
            let opt = {};

            if ( e.target.type === "checkbox" ) {
                val = e.target.checked;
            }
            opt[ key ] = val;
            this.emit( "saveOptions", opt, "Options have been saved." );
        },

        // import data button event
        importData: function() {
            if ( !window.File || !window.FileList || !window.FileReader ) {
                return this.emit( "showNotice", "error", "This browser does not support handling of files." );
            }
            let self  = this;
            let input = document.createElement( "input" );

            input.setAttribute( "type", "file" );
            input.setAttribute( "accept", ".json" );
            input.addEventListener( "change", function( e ) {
                if ( this.files && this.files.length ) {
                    if ( !/\.json$/i.test( this.files[0].name ) ) {
                        return self.emit( "showNotice", "warning", "Please select a JSON file." );
                    }
                    if ( !this.files[0].size ) {
                        return self.emit( "showNotice", "warning", "The file you selected is empty." );
                    }
                    let reader = new FileReader();
                    reader.addEventListener( "load", function( e ) {
                        let data = JSON.parse( e.target.result || "{}" ) || {};
                        self.emit( "importOptions", data.options || {}, true );
                        self.emit( "importLists", data.lists || [], true );
                    });
                    reader.readAsText( this.files[0], "utf-8" );
                }
            });
            document.body.appendChild( input );
            setTimeout( function() { input.click(); }, 100 );
            setTimeout( function() { document.body.removeChild( input ); }, 200 );
        },

        // export data button event
        exportData: function() {
            let data = {
                timestamp: Date.now(),
                date: Utils.dateString(),
                address: location.href || "",
                options: this.options,
                lists: this.lists,
            };
            try {
                let link  = document.createElement( "a" );
                let frame = document.createElement( "iframe" );
                let json  = JSON.stringify( data );
                let name  = ( this.user.provider !== undefined ) ? this.user.provider : "local";
                let type  = "application/json;charset=utf-8";
                let file  = "todos."+ name +".data.json";
                let href  = "data:" + type + "," + encodeURIComponent( json );

                if ( navigator.msSaveBlob ) { // IE
                    navigator.msSaveBlob( new Blob( [json], {type: type} ), file );
                }
                else if ( "download" in link ) { // HTML5
                    link.setAttribute( "href", href );
                    link.setAttribute( "download", file );
                    document.body.appendChild( link );
                    setTimeout( function() { link.click(); document.body.removeChild( link ); }, 100 );
                }
                else { // all else
                    frame.setAttribute( "src", href );
                    document.body.appendChild( frame );
                    setTimeout( function() { document.body.removeChild( frame ); }, 300 );
                }
            }
            catch ( e ) {
                this.emit( "showNotice", "error", e.message );
            }
        },

        // flush all data
        flushData: function() {
            let _flush = function() {
                this.emit( "saveDefaults" );
            };
            new Prompt({
                title: "Confirm...",
                confirm: "Delete all data saved by this app?",
                onAccept: _flush.bind( this ),
            });
        },

    },

};
</script>
