# docker-pull

Pull a docker image from a registry using node

```
npm install docker-pull
```

## Usage

``` js
var pull = require('docker-pull')

pull('ubuntu', function(err) {
  console.log('was pulled?', !err)
})

var p = pull('ubuntu:14.04')

p.on('progress', function() {
  console.log('pulled %d new layers and %d/%d bytes', p.layers, p.transferred, p.length)
})

p.on('end', function() {
  console.log('pull is done')
})
```

## Command line tool

There is also a command line tool

```
npm install -g docker-pull
docker-pull ubuntu:14.04
```

## License

MIT
