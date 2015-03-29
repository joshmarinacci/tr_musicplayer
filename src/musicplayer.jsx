var React = require('react');
var TagEditor = require('./components/TagEditor.jsx');

var MusicData = {
    cbs:[],
    onChange: function(cb) {
        this.cbs.push(cb);
    },
    notify: function() {
        this.cbs.forEach(function(cb) {
            if(cb) cb();
        });
    },
    artists: [
        "The Beatles",
        "Van Halen",
    ],
    albums: [
        "Yellow Submarine",
        "The Beatles (White Album)",
        "Van Halen",
        "Van Halen II"
    ],
    songs: [],
    getSortFunction:function() {
        var col = this.getSortColumn();
        var up = 1;
        if(this.getAscendingOrder() === true) {
            up = -1;
        }
        return function(a,b) {
            if(a[col] < b[col]) return up;
            if(a[col] > b[col]) return -up;
            return 0;
        };
    },
    searchSongs: function (filter, prefix) {
        var res = [];
        this.songs.forEach(function(song) {
            if(!filter) {
                res.push(song);
                return;
            }
            if(filter.type == 'album') {
                if(song.album == filter.name) res.push(song);
            }
            if(filter.type == 'artist') {
                if(song.artist == filter.name) res.push(song);
            }
        });

        if(prefix != null) {
            res = res.filter(function(song) {
                if(song.album.toLowerCase().indexOf(prefix.toLowerCase()) >= 0) return true;
                if(song.artist.toLowerCase().indexOf(prefix.toLowerCase()) >= 0) return true;
                if(song.title.toLowerCase().indexOf(prefix.toLowerCase()) >= 0) return true;
                return false;
            });
        }
        res.sort(this.getSortFunction());
        return res;
    },

    addSong: function(artist,album,title) {
        this.songs.push({artist: artist, album: album, title: title, id: artist + '_' + album + '_' + title});
    },
    build:function() {
        var self = this;
        ['Yellow Submarine','Only a Northern Song','All Together Now','Hey Bulldog','Its all too much','All you need is love'].forEach(function(title) {
            self.addSong('The Beatles','Yellow Submarine',title)
        });
        ['Back in the USSR','Dear Prudence','Glass Onion','Ob-La-Di, Ob-La-Da','Wild Honey Pie'].forEach(function(title){
            self.addSong('The Beatles','The Beatles(White Album)',title)
        });

        ["Runnin' with the Devil","Eruption","You Really Got Me","Ain't Talkin 'Bout Love"].forEach(function(title) {
            self.addSong('Van Halen','Van Halen',title)
        });
        ["You're No Good","Dance the Night Away","Somebody Get Me a Doctor","Bottoms Up!","Outta Love Again"].forEach(function(title){
            self.addSong('Van Halen','Van Halen II',title);
        });
    },
    columns:[
        {name:'artist',id:'artist'},
        {name:'album',id:'album'},
        {name:'title',id:'title'}
    ],
    sortColumn: 'album',
    getSortColumn: function() {
        return this.sortColumn;
    },
    setSortColumn: function(col) {
        if(this.sortColumn == col) {
            this.toggleSortOrder();
        } else {
            this.sortColumn = col;
        }
        this.notify();
    },
    ascendingOrder: true,
    toggleSortOrder: function() {
        this.ascendingOrder = !this.ascendingOrder;
        this.notify();
    },
    getAscendingOrder: function() {
        return this.ascendingOrder;
    },
    getColumns: function() {
        return this.columns;
    }
};
MusicData.build();

var MusicQuery = function(prefix,cb) {
    setTimeout(function(){
        var res = [];
        MusicData.artists.forEach(function(item) {
            if(item.toLowerCase().indexOf(prefix) >= 0) {
                res.push({
                    type:'artist',
                    name:item
                });
            }
        });
        MusicData.albums.forEach(function(item) {
            if(item.toLowerCase().indexOf(prefix) >= 0) {
                res.push({
                    type:'album',
                    name:item
                });
            }
        });
        cb(res);
    },0);
};


var MusicFilterTag = React.createClass({
    remove: function() {
        this.props.removeTag(this.props.tag);
    },
    render: function() {
        return <li className='music-filter'>
            <span className="type">{this.props.tag.type}</span>
            <span className="value">{this.props.tag.name}</span>
            <button className="fa fa-close fa-fw close" onClick={this.remove}></button>
        </li>
    }
});

var MusicFilterItem = React.createClass({
    render: function() {
        var highlighted = "music-item";
        if(this.props.highlighted == this.props.item) {
            highlighted += " highlighted";
        }
        return <li
            onClick={this.select}
            className={highlighted}
        ><b>{this.props.item.type}</b> <i>{this.props.item.name}</i></li>
    }

});

var MusicColumnHeader = React.createClass({
    selectColumn: function(e) {
        e.preventDefault();
        MusicData.setSortColumn(this.props.column.id);
    },
    toggleSortOrder: function(e) {
        e.preventDefault();
        MusicData.toggleSortOrder();
    },
    render: function() {
        var bc = "hidden";
        var hc = ""
        if(MusicData.getSortColumn() == this.props.column.id) {
            hc += " selected";
            bc = "fa sort-order";
            if(MusicData.getAscendingOrder() === true) {
                bc += " fa-caret-down";
            } else {
                bc += " fa-caret-up";
            }
        }
        return (<th
                    className={hc}
                    onClick={this.selectColumn}
                ><span>{this.props.column.name}</span>
                    <i className={bc}></i>
                </th>);
    }
});

var MusicSearchBox = React.createClass({
    getInitialState: function() {
        return {
            filter:null
        }
    },
    componentWillMount: function() {
        var self = this;
        MusicData.onChange(function() {
            self.setState({
                filter: self.state.filter
            })
        });
    },
    acceptTag: function(item) {
        this.setState({
            filter:item
        })
    },
    removeTag: function(tag) {
        this.refs.editor.removeTag(tag);
        this.setState({
            filter: null
        })
    },
    tagRenderer: function(tag) {
        return (<MusicFilterTag
            tag={tag}
            key={tag.type+'-'+tag.name}
            removeTag={this.removeTag}/>);
    },
    selectItem: function(item) {
        this.refs.editor.acceptTag(item);
    },
    itemRenderer: function(item, highlighted) {
        return <MusicFilterItem key={item.type+'_'+item.name} item={item} selectItem={this.selectItem} highlighted={highlighted}/>
    },
    prefixChanged: function(str) {
        console.log('prefix changed to ',str);
        this.setState({
            prefix: str
        });
    },
    render: function() {
        return (
            <div>
                <TagEditor
                    ref='editor'
                    queryHandler={MusicQuery}
                    onAccept={this.acceptTag}
                    tagRenderer={this.tagRenderer}
                    itemRenderer={this.itemRenderer}
                    onPrefixChange={this.prefixChanged}
                />
                <table>
                    <thead>
                        <tr>
                        {
                            MusicData.getColumns().map(function(column){
                                return <MusicColumnHeader key={column.id} column={column}/>
                            })
                        }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            MusicData.searchSongs(this.state.filter,this.state.prefix).map(function(song) {
                                return <tr key={song.id}><td>{song.artist}</td><td>{song.album}</td><td>{song.title}</td></tr>
                            })
                            }
                    </tbody>
                </table>
            </div>);
    }
});

React.render(<MusicSearchBox/>, document.getElementById("content"));
