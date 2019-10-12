const {ipcRenderer} = require("electron");

class Uploads {
  constructor() {}

  renderUploads() {
    EthoMainGUI.renderTemplate("uploads.html", {});
    $(document).trigger("render_uploads");
  }
}

// create new uploads variable
EthoUploads = new Uploads();