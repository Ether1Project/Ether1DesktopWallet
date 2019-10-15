const {
  ipcRenderer
} = require("electron");

class About {
  constructor() {}

  renderAbout() {
    EthoMainGUI.renderTemplate("about.html", {});
    $(document).trigger("render_about");
  }
}

// create new uploads variable
EthoAbout = new About();
