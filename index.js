var docker = require('docker-remote-api')
var parse = require('docker-parse-image')
var throughJSON = require('through-json')
var through = require('through2')
var events = require('events')
var pump = require('pump')

var pull = function (image, opts, cb) {
  if (typeof opts === 'function') return pull(image, null, opts)
  if (!opts) opts = {}

  image = parse(image)
  if (!image) throw new Error('Invalid image')

  var request = docker({host: opts.host, version: opts.version || 'v1.21'})
  var that = new events.EventEmitter()
  var layers = {}
  var progress = {}

  that.image = image.name

  progress.layers = that.layers = 0
  progress.transferred = that.transferred = 0
  progress.length = that.length = 0

  var write = function (data, enc, cb) {
    if (data.error) return cb(new Error(data.error.trim()))
    if (!data.id || !data.progressDetail || !data.progressDetail.current) return cb()

    if (layers[data.id] === undefined) {
      layers[data.id] = 0
      progress.layers = that.layers = that.layers + 1
      progress.length = that.length = that.length + (data.progressDetail.total || 0)
    }

    var cur = data.progressDetail.current
    progress.transferred = that.transferred = that.transferred + (cur - layers[data.id])
    layers[data.id] = cur

    that.emit('progress', progress)

    cb()
  }

  var fromImage = image.repository

  if (image.namespace) {
    fromImage = image.namespace + '/' + fromImage
  }

  if (image.registry) {
    fromImage = image.registry + '/' + fromImage
  }

  var post = request.post('/images/create', {
    qs: {
      fromImage: fromImage,
      tag: image.tag || 'latest'
    },
    headers: {
      'X-Registry-Auth': {
        username: opts.username || 'anon',
        password: opts.password || '',
        email: opts.email
      }
    },
    body: null
  }, function (err, response) {
    if (err) return that.emit('error', err)

    pump(response, throughJSON(), through.obj(write), function (err) {
      if (err) return that.emit('error', err)
      that.emit('end')
    })
  })

  that.destroy = function () {
    post.destroy()
  }

  if (cb) {
    that.on('end', cb)
    that.on('error', cb)
  }

  return that
}

module.exports = pull
