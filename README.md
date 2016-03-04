# docker-pull

Pull a docker image from a registry using node

```
npm install docker-pull
```

## Usage

``` js
var pull = require('docker-pull')

pull('ubuntu', function (err) {
  console.log('was pulled?', !err)
})

var p = pull('ubuntu:14.04')

p.on('progress', function () {
  console.log('pulled %d new layers and %d/%d bytes', p.layers, p.transferred, p.length)
})

p.on('end', function () {
  console.log('pull is done')
})
```

## Api

#### `var p = pull(image, [options], [callback]])`

Pull a docker image. Returns an `EventEmitter`. Optionally you can specify the following options:

```js
{
  host:     'registry.example.com', // docker registry
  version:  'v2',                   // defaults to 'v1.15'
  username: 'user',                 // defaults to 'anon'
  password: 'pwd',                  // defaults to ''
  email:    'user@example.com'      // no default
}
```

#### `p.on('progress', progress)`

Emitted for each data chunk.

#### `p.on('end', function () {})`

Emitted when the operation has ended.

#### `p.on('error', err)`

Emitted when an error happens during communication with the registry.

## Command line tool

There is also a command line tool

```
npm install -g docker-pull
docker-pull ubuntu:14.04
```

## License

MIT
