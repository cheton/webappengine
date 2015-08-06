var log = require('./lib/log');

log.setLevel('debug');
log.debug('webappengine started');

require('./app');

var loading = document.getElementById('loading');
if (loading) {
    loading.style.display = 'none';
}
