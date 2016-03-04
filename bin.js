#!/usr/bin/env node

var pull = require('./')
var log = require('single-line-log').stdout
var fs = require('fs')
var pretty = require('pretty-bytes')
var parse = require('docker-parse-image')
var minimist = require('minimist')
var path = require('path')
var url = require('url')

var cfg = {}
try {
  cfg = JSON.parse(fs.readFileSync(path.join(process.env.HOME || process.env.USERPROFILE, '.dockercfg'), 'utf-8'))
} catch (err) {}

var argv = minimist(process.argv.slice(2), {
  alias: {host: 'H', password: 'p', username: 'u'}
})

var image = argv._[0]

if (argv.version) {
  console.log(require('./package').version)
  process.exit(0)
}

if (!image) {
  console.error(fs.readFileSync(path.join(__dirname, 'help.txt'), 'utf-8'))
  process.exit(1)
}

if (!argv.username) {
  var registry = parse(image).registry || 'index.docker.io'
  Object.keys(cfg).forEach(function (addr) {
    if (url.parse(addr).host !== registry) return
    var auth = new Buffer(cfg[addr].auth, 'base64').toString().split(':')
    argv.username = auth.shift()
    argv.password = auth.join(':')
  })
}

var p = pull(image, argv)

var print = function () {
  log(
    'Pulling ' + p.image + '\n' +
    'Fetched ' + p.layers + ' ' + (p.transferred ? '(' + pretty(p.transferred) + '/' + pretty(p.length) + ') ' : '') + 'new image layer' + (p.layers !== 1 ? 's' : '') + '\n'
  )
}

print()
p.on('progress', print)

p.on('error', function (err) {
  console.log('Error: ' + err.message)
  process.exit(2)
})
