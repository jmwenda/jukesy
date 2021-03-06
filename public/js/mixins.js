Mixins.TrackViewEvents = {

  removeTrack: function() {
    this.model.collection.remove([ this.model ])
  },
      
  playNow: function() {
    var clone = new Model.Track(this.model.toJSON())
    NowPlaying.tracks.add([ clone ], { at: _.indexOf(NowPlaying.tracks.models, Video.track) + 1 })
    clone.play(true)
  },
  
  queueNext: function() {
    NowPlaying.tracks.add([ new Model.Track(this.model.toJSON()) ], { at: _.indexOf(NowPlaying.tracks.models, Video.track) + 1 })
  },
  
  queueLast: function() {
    NowPlaying.tracks.add([ new Model.Track(this.model.toJSON()) ])
  },
  
  addToPlaylist: function() {
    Playlists.addToView.render({ tracks: [ new Model.Track(this.model.toJSON()) ] })
  },
  
  dropdown: function() {
    this.$el.find('.dropdown-toggle').dropdown('toggle')
    return false
  }
}

View.Form = Backbone.View.extend({
  
  keyDown: function(event) {
    if (event.keyCode == 13) {
      this.submit()
      $(event.target).blur()
      return false
    }
  },
  
  submit: function() {
    var sendJSON = {}
    _.each(this.$el.find('[name]'), function(inputEl) {
      var $input = $(inputEl)
      sendJSON[$input.attr('name')] = $input.val()
    })
    this.model.save(sendJSON, {
      success: this.submitSuccess,
      error: this.submitError
    })
    return false
  },
  
  submitError: function(model, error) {
    this.removeErrors()
    var errorJSON = {}
    try {
      errorJSON = JSON.parse(error.responseText)
    } catch(e) {}
    
    if (error.status == 401 && !errorJSON.errors) {
      this.addAlert('unauthorized')
    } else if (error.status) {
      this.addErrors(errorJSON.errors)
    } else {
      this.addAlert()
    }
    this.clearPasswords()
    this.focusInput()
  },
  
  addErrors: function(errors) {
    var self = this
    _.each(errors, function(error, field) {
      if (field == '$') {
        self.addAlert(error)
      } else {
        var $group = self.$el.find('.controls [name=' + field + ']').parents('.control-group')
        $group.addClass('error')
        $group.find('span.help-inline').html(parseError(field, error))
      }
    })
  },

  removeErrors: function() {
    this.$el.find('.error').removeClass('error')
    this.$el.find('.alert').remove()
    this.$el.find('span.help-inline').html('')
  },
  
  addAlert: function(message) {
    new View.Alert({
      className: 'alert-error alert fade',
      message: parseError(null, message || 'no_connection'),
      $prepend: this.elAlertFind()
    })
  },
  
  focusInput: function() {
    var self = this
    _.defer(function() {
      self.elFocusFind().focus()
    })
  },
  
  clearPasswords: function() {
    this.$el.find('input[type=password]').val('')
  },
  
  elAlertFind: function() {
    return this.elAlert ? this.$el.find(this.elAlert) : this.$el
  },
  
  elFocusFind: function() {
    var $input
    if (this.elFocus) {
      $input = this.$el.find(this.elFocus)
    } else {
      $input = this.$el.find('.error:first [name]')
      if (!$input.length) {
        $input = this.$el.find('[name]:first')
      }
    }
    return $input
  }  

})
