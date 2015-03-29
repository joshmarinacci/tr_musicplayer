require('node-thrust')(function(err, api) {
    var url = 'file://'+__dirname+'/src/launch.html';
    console.log("url = ", url);
    api.window({ root_url: url }).show();
});

