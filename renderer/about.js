const {
  ipcRenderer
} = require("electron");

class About {
  constructor() {}

  renderAbout() {
    EthoMainGUI.renderTemplate("about.html", {});
    $(document).trigger("render_about");
    let shell = require('electron').shell
    document.addEventListener('click', function(event) {
      if (event.target.tagName === 'A' && event.target.href.startsWith('http')) {
        event.preventDefault()
        shell.openExternal(event.target.href)
      }
    })
  }
}

// create new uploads variable
EthoAbout = new About();
