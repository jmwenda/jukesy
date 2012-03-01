var app = require('./'),
    logger = require('./lib/logger'),
    error = require('./lib/error'),
    User = app.model('User'),
    ApplicationController = app.controller('Application'),
    UserController = app.controller('User'),
    SessionController = app.controller('Session');

module.exports = function(server) {
  
  server.get('/status', ApplicationController.status);
  server.get('/fail', ApplicationController.fail);
  server.get('/', ApplicationController.home);

  server.get('/lastfm/:type/:method/:query', ApplicationController.search);
  //server.get('/playlist

  server.get('/users', UserController.index);
  server.get('/users/:username', UserController.show);
  server.post('/users/create', UserController.create);
  server.post('/users/:username', UserController.update);
  //server.delete('/users/:username', UserController.delete);

  // users/:user/playlists/playlist-slug, separate output for (.html) and .json
  // (.html) sends back home layout w/meta tags, .json sends the playlist

  server.post('/login', SessionController.create);

  server.error(function(err, req, res) {
    if (err.name === 'ValidationError' || err.name === 'ValidatorError')
      err = new error.ValidationError(err);

    if (!err.code || err.code == 500) {
      res.render('500', { layout: false, status: 500 });
    } else if (err.code == 404) {
      res.render('404', { layout: false, status: 404 });
    } else {
      res.send({
        message : err.message,
        errors  : err.errors,
        code    : err.code,
        type    : err.type
      }, err.code);
    }

    if (typeof err.stack != 'undefined' && err.stack)
      logger.error(err.stack);
  });

  server.get('/404', ApplicationController.notFound);
  server.get('/500', ApplicationController.internalServerError);
  server.all('*', ApplicationController.notFound);
};