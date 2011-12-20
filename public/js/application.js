$(function() {


  //
  // Local routes (single-page app style, motherfucker)
  //
  AppRouter = Backbone.Router.extend({
    initialize: function() {
      this.bind('appview', Video.fullscreenOff);
      this.bind('appview', this.hideViews);
    },

    routes: {
      '/'              : 'home',
      '/search/:query' : 'searchAll',
      //'/artist/:query': 'searchArtist',
      //'/album/:query': 'searchAlbum',
      //'/track/:query': 'searchTrack',
      '/settings'      : 'settings',
      '/favorites'     : 'favorites',
      '/tag-radio'     : 'tagRadio',
      '/broadcasts'    : 'broadcasts'

      //'/playlists'         : 'playlistsIndex',
      //'/playlist/:id'      : 'playlistView',
      //'/playlist/:id?play' : 'playlistPlay',
    },

    hideViews: function() {
      $('#main').hide();
    },

    home: function() {
      this.trigger('appview');
      $('#main').show();
      MainView.render(NowPlaying);
    },

    settings: function() {
      this.trigger('appview');
      $('#main').show();
      MainView.render('settings');
    },

    favorites: function() {
      this.trigger('appview');
      $('#main').show();
      MainView.render('favorites');
    },

    tagRadio: function() {
      this.trigger('appview');
      $('#main').show();
      MainView.render('tagRadio');
    },

    broadcasts: function() {
      this.trigger('appview');
      $('#main').show();
      MainView.render('broadcasts');
    },

    /*
    playlistPlay: function(id) {
      this.trigger('appview');
      $('#main').show();
      NowPlaying.setPlaylist(Playlists.get(id));
    },
    */

    searchAll: function(query) {
      query = decodeURIComponent(query);
      window.Search = new Model.Search({ query: query });

      this.trigger('appview');
      $('#main').show();
      MainView.render(Search);
    }
  });


  //
  // Used primarily app-wide key bindings.
  //
  View.App = Backbone.View.extend({
    el: $(document),

    events: {
      'keypress #query'      : 'searchAll',
      'keydown'              : 'keyMapper',
      'keyup'                : 'setMaxVolume'
      //'click #login'         : 'login'
    },

    /*
    login: function(e) {
      new Model.Modal({ type: 'login' });
    },
    */

    searchAll: function(e) {
      if (e.keyCode == 13) {
        Router.navigate('/search/' + encodeURIComponent($('#query').val()), true);
        $('#query').val('').blur();
      }
    },

    // The event lacks keyboard modifiers (ctrl, alt, shift, meta)
    keypressHasModifier: function(e) {
      return (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) ? true : false;
    },

    setMaxVolume: function(e) {
      if ($(e.target).is('input, textarea')) {
        return;
      }
      if (e.keyCode == 38 || e.keyCode == 40) {
        var value = Controls.$volume.slider('value');
        if (value) {
          Controls.lastMaxVolume = value;
        } else {
          //Video.mute();
        }
      }
    },

    keyMapper: function(e) {
      if ($(e.target).is('input, textarea')) {
        return;
      }
      switch (e.keyCode) {
        case 65: // CTRL-A, META-A
          if (e.metaKey || e.ctrlKey) {
            var $el = $(Search.track.view.el),
                trackView = Search.track.view.collection.models[0].view,
                selector = trackView.tagName + '.' + trackView.className;

            if ($el.find(selector + '.selected').length < $el.find(selector).length) {
              $el.find(selector).addClass('selected');
            } else {
              $el.find(selector).removeClass('selected');
            }
            return false;
          }
          return;
        case 77: // M
          if (this.keypressHasModifier(e)) return;
          Controls.toggleMute(e);
          return false;
        case 32: // SPACEBAR
          ($('#play').hasClass('pause')) ? window.Controls.pause() : window.Controls.play();
          return false;
        case 37: // LEFT
          if (this.keypressHasModifier(e)) return;
          window.Controls.prev();
          return false;
        case 39: // RIGHT
          if (this.keypressHasModifier(e)) return;
          window.Controls.next();
          return false;
        case 38: // UP
          if (this.keypressHasModifier(e)) return;
          Controls.$volume.slider('value', Controls.$volume.slider('value') + 5);
          return false;
        case 40: // DOWN
          if (this.keypressHasModifier(e)) return;
          Controls.$volume.slider('value', Controls.$volume.slider('value') - 5);
          return false;
        case 70: // F
          if (this.keypressHasModifier(e)) return;
          Video.toggleFullscreen();
          return false;
        case 191: // /
          if (this.keypressHasModifier(e)) return;
          Video.fullscreenOff();
          $('#query').focus();
          return false;
      }
    }
  });


  //
  // Main viewport -- this is where search results, playlists, now playing, and mostly everything else will display.
  //
  View.Main = Backbone.View.extend({
    el: '#main',

    template: {
      home          : _.template($('#home-template').html()),
      settings      : _.template($('#settings-template').html()),
      favorites     : _.template($('#favorites-template').html()),
      tagRadio      : _.template($('#tag-radio-template').html()),
      broadcasts    : _.template($('#broadcasts-template').html())
    },

    initialize: function() {
      // Auto-load more search results on scroll.
      $('#main-wrapper').bind('scroll', this.loadMore());

      this.render();
      this.delegateEvents();
    },

    loadMore: function() {
      return _.throttle(function() {
        if (Backbone.history.fragment.match(/^\/search\//) && ($('#main-wrapper').height() * 2) + $('#main-wrapper').scrollTop() > $('#main').height()) {
          Search.loadMore('track');
        }
      }, 300);
    },

    // target can be a model object or a string for a basic template
    render: function(target) {
      window.lastSelected = null;
      if (typeof target == 'object') {
        $(this.el).html(target.view.render());
        $('#quickbar .' + target.view.className).addClass('active').siblings().removeClass('active');
      } else {
        target = target || 'home';
        $(this.el).html(this.template[target]);
        $('#quickbar .' + target.replace(/([A-Z])/,'-$1').toLowerCase()).addClass('active').siblings().removeClass('active');
      }
    }
  });


});

$(function() {
  window.AppView    = new View.App();
  window.Video      = new Model.Video();
  window.Controls   = new View.Controls();
  window.Playlists  = new Collection.Playlists();
  window.NowPlaying = new Model.NowPlaying();

  Playlists.fetch();
  PlaylistsView = new View.Playlists({ quickbar: true });

  window.MainView = new View.Main();
});

