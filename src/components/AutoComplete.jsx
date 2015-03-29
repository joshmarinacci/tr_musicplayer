/**
 * Created by josh on 3/27/15.
 *
 * autocomplete is a common dropdown system used for search fields, text entry, and tag editors.
 * in each case there is the same api for providing completion list, with the option to auto-insert
 * if there is only one valid option.
 * if list is long it must scroll
 * the user must be able to keep typing to narrow down the list
 * the user must be able to arrow up and down to choose items (with ghost text ahead?)
 * hitting enter chooses the item, it doesn't activate the form
 * the dropdown must be customizable for the application with styles and special content like images or large panels.
 *
 *
 * must work in the following use cases
 *
 * tag editor,  as you type a word you get a dropdown of previously used tags which
 *   may not be an exact word match, but are likely matches. enter to choose. comma to choose. not space to choose?
 *
 * text field to select a state.
 *   dropdown button shows all states in a scrolling list below. typing narrows
 *   down the list. choose with mouse or arrow keys and enter.
 *   since this field is restricted to exactly those values, navigating to choose an item modifies the text field
 *   the textfield shows error message if you somehow get an invalid value
 *
 * search box.  as you type it does real time recommendations.
 *   this comes over the network so further recommendations may pop in while you continue to type or navigate
 *   items are not plain text completions, but full panels with the link name, link url, and possibly control buttons
 *   for things like 'never show this to me again'
 *
 * search box for music
 *   this searches across multiple fields and organizes the results into groupings by artist, album, and song, where
 *   each grouping shows the top N results. Choosing one of those replaces the current box contents with a special tag
 *   form of search criteria. ex:
 *
 *   type van hal
 *   van halen artist shows up
 *   van halen I and II and III albums show up
 *   choose van halen artist
 *   artist:van halen  tag jumps into the editor. partially typed 'van hal' disappears.
 *   can now continue typing to further narrow down by genre, song, lyrics, etc. where it also matches artist:van halen.
 *
 *
 *   this means tags must be customizable to be used as search filters, not just tags.
 *
 *  start with auto-complete. given a substring, produce a list of possible completions rendered with a renderer.
 *  default renderer uses strings to list items with standard CSS. custom renderer may do anything.
 *  popup container is managed by the system and goes away as needed. it also grabs focus? it must handle arrow
 *  keys and selection and enter key.
 *
 *  now make a text field which triggers the autocomplete. use for standard search. has it's own validation function.
 *  now make a tag entry field which uses the accepted results as new tags, also works w/o auto complete. just add tags separated by
 *  spaces or commas.
 *
 *  now make an arduino search which as custom results
 *
 *  now make a music search which has custom query filter tags
 *
 *
 *  //tag editor api needs callback for adding tag, and skipping it if duplicates
 *
 *
 */
var React = require('react');

var ResultItem = React.createClass({
    select: function(e) {
        e.preventDefault();
        this.props.select(this.props.item);
    },
    render: function() {
        var highlighted = "";
        if(this.props.highlighted == this.props.item) {
            highlighted += " highlighted";
        }
        return <li
            className={highlighted}
            onClick={this.select}
        >{this.props.item}</li>
    }
});

var AutocompleteTextfield = React.createClass({
    getInitialState: function() {
        return {
            autohidden:true,
            prefix:"",
            highlighted:null,
            results:[]
        }
    },
    keyPressed:function(e) {
        //console.log("event",e.key,e.keyCode);
        if(e.key == "ArrowDown") {
            e.preventDefault();
            var n = this.state.results.indexOf(this.state.highlighted);
            if(n < 0) {
                n = 0;
            } else if(n >= this.state.results.length-1) {
                n = this.state.results.length - 1;
            } else {
                n++;
            }
            this.setState({
                highlighted:this.state.results[n]
            });
        }
        if(e.key == 'ArrowUp') {
            e.preventDefault();
            var n = this.state.results.indexOf(this.state.highlighted);
            if(n <= 0) {
                n = 0;
            } else if(n > this.state.results.length-1) {
                n = this.state.results.length - 1;
            } else {
                n--;
            }
            this.setState({
                highlighted:this.state.results[n]
            });
        }
        if(e.key == 'Enter' && this.state.autohidden === false) {
            var n = this.state.results.indexOf(this.state.highlighted);
            if(n >= 0) {
                this.selectItem(this.state.results[n]);
            }
        }
    },
    textChanged: function(e) {
        e.preventDefault();
        var value = this.refs.field.getDOMNode().value;
        if(value && value.length >= 1) {
            this.showQuery(value);
        }
        if(value.length <=0) {
            this.setState({
                autohidden:true
            });
        }
        this.setState({
            prefix: value
        });

        if(this.props.onPrefixChange) {
            this.props.onPrefixChange(value);
        }
    },
    togglePopup: function() {
        this.setState({
            autohidden: !this.state.autohidden
        });
    },
    selectItem: function(item) {
        this.setState({
            autohidden:true,
            prefix:item,
            highlighted: null
        });
        if(this.props.onAccept) {
            this.props.onAccept(item);
        }
    },
    showQuery: function(item) {
        var results = [];
        this.setState({
            autohidden:false,
            results:results,
            highlighted:null
        });
        var self = this;
        this.props.queryHandler(item,function(results) {
            self.setState({
                results:results
            });
        });
    },
    clear: function() {
        this.setState({
            autohidden:true,
            prefix:""
        })
    },
    renderItem: function(item) {
        if(this.props.itemRenderer != null) {
            return this.props.itemRenderer(item, this.state.highlighted);
        }
        return <ResultItem
            key={item}
            item={item}
            select={this.selectItem}
            highlighted={this.state.highlighted}
        />
    },
    render: function() {
        var cn = "popup";
        if(this.state.autohidden === true) {
            cn += " hidden";
        }
        var out = this.state.results.map(this.renderItem);
        return (
            <div className="autocomplete">
                <input ref='field'
                    type='text'
                    onChange={this.textChanged}
                    value={this.state.prefix}
                    onKeyDown={this.keyPressed}
                    placeholder="placeholder"
                />
                <button onClick={this.togglePopup} className="fa fa-caret-down"></button>
                <ul className={cn}>{out}</ul>
            </div>
        );
    }
});

module.exports = AutocompleteTextfield;
