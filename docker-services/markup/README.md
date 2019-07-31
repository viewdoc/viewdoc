# markup

> A small app to expose [github/markup](https://github.com/github/markup) as a service

## Usage

### Build

```bash
$ docker build -t viewdoc/markup .
```

### Production

```bash
$ docker run --rm -it -p 4100:4100 viewdoc/markup
```

### Development

```bash
$ docker run --rm -it -p 4100:4100 -v "$(pwd)":/usr/src/app viewdoc/markup
```

### Test

```bash
$ curl -i -X POST http://localhost:4100/markdown -d 'Hello, **World**! :heart:'
```
