const path = require('path')

exports.github = {
  accessToken: 'GITHUB_ACCESS_TOKEN',
}

exports.cache = {
  basePath: path.join(__dirname, '../tmp/cache'),
  maxDataLength: 1000000000, // 1 GB
  defaultMaxAge: { hours: 1 },
}
