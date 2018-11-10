/* eslint-env browser */
const {
  GET_FILE,
  SAVE,
} = require('./tasks/task-names');
const {
  PATH_CSS,
  PATH_DIFF_CSS,
  PATH_DIFF_JS,
  PATH_JS,
  PATH_SOCKET_JS,
} = require('./tasks/paths');
const { getServerUrl, CONFIG_KEY } = require('./config');

function readFile(fileType) {
  return cy.task(GET_FILE, fileType);
}

function initUi() {
  const $head = Cypress.$(window.parent.window.document.head);
  const config = Cypress.env(CONFIG_KEY);

  if ($head.find('#cypress-plugin-snapshot').length > 0) {
    return;
  }

  readFile(PATH_DIFF_CSS).then((content) => {
    $head.append(`<style>${content}</style>`);
  });

  readFile(PATH_DIFF_JS).then((content) => {
    $head.append(`<script>${content}</script>`);
  });

  if (config.serverEnabled) {
    readFile(PATH_SOCKET_JS).then((content) => {
      $head.append(`<script>
      ${content}

      var saveSnapshot = ((data) => {
        var socket = io('${getServerUrl(config)}');

        return (data) => {
          socket.emit('${SAVE}', data);
        };
      })();
      </script>`);
    });
  }

  readFile(PATH_CSS).then((content) => {
    $head.append(`<style id="cypress-plugin-snapshot">${content}</style>`);
  });

  readFile(PATH_JS).then((content) => {
    $head.append(`<script>${content}</script>`);
  });
}

module.exports = {
  initUi,
};
