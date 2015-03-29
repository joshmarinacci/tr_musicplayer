var React = require('react');
var TF1 = require('./AutoComplete.jsx');

var TagItem = React.createClass({
    removeTag: function() {
        this.props.removeTag(this.props.tag);
    },
    render: function() {
        return <div className="tag">{this.props.tag}<button onClick={this.removeTag}>x</button></div>
    }
});


var TagEditor = React.createClass({
    getInitialState: function() {
        return {
            tags:[]
        }
    },
    componentWillMount: function() {
        if(this.props.initialTags) {
            this.setState({
                tags:this.props.initialTags
            });
        }
    },
    acceptTag: function(text){
        var n = this.state.tags.indexOf(text);
        if(n >= 0) {
            console.log('already there. cant add');
        } else {
            this.setState({
                tags: this.state.tags.concat([text])
            });
        }
        this.refs.textinput.clear();
        if(this.props.onAccept) {
            this.props.onAccept(text);
        }
    },
    removeTag: function(tag) {
        var n = this.state.tags.indexOf(tag);
        if(n >= 0) {
            this.state.tags.splice(n,1);
        }
        this.setState({
            tags: this.state.tags
        })
    },
    renderTag: function(tag) {
        if(this.props.tagRenderer) {
            return this.props.tagRenderer(tag);
        }
        return <TagItem tag={tag} key={tag} removeTag={this.removeTag}/>
    },
    render: function(){
        var out = this.state.tags.map(this.renderTag);
        return (
            <div className='tags'>
                {out}
                <TF1
                    ref='textinput'
                    queryHandler={this.props.queryHandler}
                    itemRenderer={this.props.itemRenderer}
                    onAccept={this.acceptTag}
                    onPrefixChange={this.props.onPrefixChange}
                />
            </div>
        );
    }
});


module.exports = TagEditor;