Model.Radio = Backbone.Model.extend({
  defaults: {
    active: false
  },
  
  initialize: function() {
    _.bindAll(this, 'discover')
  },
  
  disable: function() {
    this.set({ active: false })
    clearInterval(this.interval)
  },
  
  enable: function() {
    this.set({ active: true })
    this.interval = setInterval(this.discover, 2000)
    Video.repeat = false
    Shuffle.disable()
  },
  
  discover: function() {
    var track
    
    if (!window.NowPlaying || !NowPlaying.tracks.length || this.tracks) {
      return
    }
    if (Video.track && _.indexOf(NowPlaying.tracks.models, Video.track) + 3 < NowPlaying.tracks.length) {
      return
    }
    
    track = NowPlaying.tracks.randomWithout([])
    
    if (track.similarTracks) {
      track.addSimilarTrack()
    } else {
      this.tracks = new Model.LastFM({ artist: track.get('artist'), track: track.get('name'), method: 'track.getSimilar', limit: 50, hide: true })
      this.tracks.on('queryCallback', function() {
        track.similarTracks = new Collection.Tracks(_.map(this.results, function(result) { return result.toJSON() }))
        track.addSimilarTrack()
        Radio.tracks = null
      }, this.tracks)
    }
  }
  
})


;
