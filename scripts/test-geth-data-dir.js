"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function loadModule(filename, mocks) {
  const module = {exports: {}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", filename), "utf8"), {
    module,
    require: name => Object.prototype.hasOwnProperty.call(mocks, name) ? mocks[name] : require(name),
    console,
    Buffer,
    process
  }, {filename});
  return module.exports;
}

function loadResolver(output, onCall) {
  return loadModule("modules/gethDataDir.js", {
    child_process: {
      execFileSync(binary, args, options) {
        assert.strictEqual(binary, "bundled-geth");
        assert.strictEqual(args.join(), "dumpconfig");
        assert.strictEqual(options.windowsHide, true);
        assert.strictEqual(options.timeout, 15000);
        if (onCall) onCall();
        return output;
      }
    }
  });
}

async function main() {
  for (const dataDir of [
    "C:\\Users\\Test User\\AppData\\Local\\Etho",
    "C:\\Users\\Test User\\AppData\\Roaming\\Etho",
    "C:\\Users\\Test User\\AppData\\Local\\Ether1"
  ]) {
    const resolver = loadResolver("[Eth]\r\n\r\nDataDir = " + JSON.stringify(dataDir) + "\r\n[Node.P2P]\r\n");
    assert.throws(() => resolver.getDataDir(), /not ready/);
    assert.strictEqual(resolver.resolveDataDir("bundled-geth"), dataDir);
    assert.strictEqual(resolver.getDataDir(), dataDir);
  }
  for (const output of ["", 'DataDir = ""', 'DataDir = "relative"', 'DataDir = "geth"']) {
    assert.throws(() => loadResolver(output).resolveDataDir("bundled-geth"), /absolute data directory/);
  }
  assert.throws(() => loadResolver('DataDir = "bad\\q"').resolveDataDir("bundled-geth"));
  assert.throws(() => loadResolver("", () => {throw new Error("geth failed");}).resolveDataDir("bundled-geth"), /geth failed/);

  // Integration fixtures never read or modify the real user's node directories.
  const validationDir = path.resolve(__dirname, "..", "dist", "local-validation");
  fs.mkdirSync(validationDir, {recursive: true});
  const root = fs.mkdtempSync(path.join(validationDir, "wallet-paths-"));
  const dataDir = path.join(root, "Etho");
  const legacy = path.join(root, "Ether1");
  const keystore = path.join(dataDir, "keystore");
  const handlers = {};
  const electron = {
    app: {getPath: () => root},
    dialog: {},
    ipcMain: {on: (name, handler) => {handlers[name] = handler;}}
  };
  const address = "1".repeat(40);
  const keyFile = "UTC--fixture--" + address;
  fs.mkdirSync(keystore, {recursive: true});
  fs.mkdirSync(legacy);
  fs.writeFileSync(path.join(keystore, keyFile), '{"fixture":true}');
  fs.writeFileSync(path.join(legacy, "keep"), "legacy data");
  let importedInto;
  let exportedFrom;
  class Zip {
    extractAllTo(destination) {importedInto = destination;}
    addFile(name, contents) {
      assert.strictEqual(name, keyFile);
      assert.strictEqual(contents.toString(), '{"fixture":true}');
      exportedFrom = keystore;
    }
    writeZip() {}
  }
  loadModule("modules/accounts.js", {
    electron,
    "adm-zip": Zip,
    "./gethDataDir": {getDataDir: () => dataDir}
  });
  electron.dialog.showOpenDialog = async () => ({filePaths: [path.join(root, "import.zip")]});
  let importResult;
  await handlers.importAccounts({reply: (name, result) => {importResult = result;}});
  assert.strictEqual(importResult.success, true);
  assert.strictEqual(importedInto, keystore);

  electron.dialog.showSaveDialog = async () => ({filePath: path.join(root, "export.zip")});
  handlers.exportAccounts({});
  // exportAccounts uses a callback API, so wait for its directory read to finish.
  const deadline = Date.now() + 3000;
  while (!exportedFrom && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 10));
  assert.strictEqual(exportedFrom, keystore);

  const saved = {address: "2".repeat(40), fixture: true};
  const saveEvent = {};
  await handlers.saveAccount(saveEvent, saved);
  assert.strictEqual(saveEvent.returnValue, true);
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(path.join(keystore, "0x" + saved.address), "utf8")), saved);

  const deleteEvent = {};
  handlers.deteteAccount(deleteEvent, "0x" + address);
  while (deleteEvent.returnValue === undefined && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 10));
  assert.strictEqual(deleteEvent.returnValue, true);
  assert.strictEqual(fs.existsSync(path.join(keystore, keyFile)), false);

  class Datastore {
    loadDatabase() {}
    ensureIndex() {}
  }
  loadModule("modules/database.js", {
    electron,
    "electron-storage": {},
    "@seald-io/nedb": Datastore,
    moment: {},
    "./gethDataDir": {getDataDir: () => dataDir}
  });
  const chainDir = path.resolve(dataDir, "geth");
  assert.strictEqual(path.dirname(chainDir), dataDir);
  assert.ok(dataDir.startsWith(validationDir + path.sep));
  fs.mkdirSync(path.join(chainDir, "chaindata"), {recursive: true});
  fs.writeFileSync(path.join(chainDir, "chaindata", "fixture"), "chain data");
  fs.mkdirSync(path.join(dataDir, "ethoFS"));
  const resetEvent = {};
  handlers.deleteBlockchainData(resetEvent);
  assert.strictEqual(resetEvent.returnValue, true);
  assert.strictEqual(fs.existsSync(chainDir), false);
  assert.strictEqual(fs.existsSync(keystore), true);
  assert.strictEqual(fs.existsSync(path.join(dataDir, "ethoFS")), true);
  assert.strictEqual(fs.readFileSync(path.join(legacy, "keep"), "utf8"), "legacy data");

  const uploads = fs.readFileSync(path.join(__dirname, "..", "renderer", "uploads.js"), "utf8");
  const helper = uploads.match(/function getKeyStoreLocation\(\) \{[\s\S]*?\n\}/)[0];
  assert.strictEqual(vm.runInNewContext(helper + "\ngetKeyStoreLocation();", {
    ipcRenderer: {sendSync: name => {assert.strictEqual(name, "getGethDataDir"); return {dataDir};}}
  }), dataDir);
  assert.throws(() => vm.runInNewContext(helper + "\ngetKeyStoreLocation();", {
    ipcRenderer: {sendSync: () => ({error: "not ready"})}
  }), /not ready/);

  console.log("Passed: geth path resolution, account import/export/save/delete, EthoFS path, and blockchain reset isolation.");
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
