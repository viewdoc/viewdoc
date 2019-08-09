const path = require('path')

exports.github = {
  accessToken: 'GITHUB_ACCESS_TOKEN',
}

exports.gitlab = {
  accessToken: 'GITLAB_ACCESS_TOKEN',
}

exports.markupService = {
  baseUrl: 'http://markup:4100'
}

exports.exporterService = {
  baseUrl: 'http://exporter:4200'
}

exports.exporter = {
  basePath: path.join(__dirname, '../tmp/exporter')
}

exports.cache = {
  basePath: path.join(__dirname, '../tmp/cache'),
  maxDataLength: 1000000000, // 1 GB
  defaultMaxAge: { hours: 1 },
}
