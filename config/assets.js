var assets = {

  js: [
    'js/lib/json2.js',
    'js/lib/underscore-min.js',
    'js/lib/backbone.js',
    'js/lib/backbone.localStorage.js',
    'js/lib/swfobject.js',
    'js/lib/less-1.1.3.min.js',
    'js/boot.js',
    'js/modal.js',
    'js/track.js',
    'js/playlist.js',
    'js/controls.js',
    'js/search.js',
    'js/video.js',
    'js/application.js'
  ],

  less: [
    'css/app.less'
  ]

};

exports.development = assets;
exports.test = assets;
exports.staging = assets;
exports.production = assets;
