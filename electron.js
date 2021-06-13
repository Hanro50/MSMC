const MSMC = require(__dirname + "/microsoft");
const { BrowserWindow } = require('electron');

module.exports.FastLaunch = (callback, updates, prompt) => {
    const token = {
        client_id: "00000000402b5328",
        redirect: "https://login.live.com/oauth20_desktop.srf",
        prompt: prompt
    }
    var redirect = MSMC.CreateLink(token);
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600
    })
    mainWindow.loadURL(redirect);
    const contents = mainWindow.webContents;
    contents.on('did-finish-load', () => {
        const loc = contents.getURL();
        if (loc.startsWith(token.redirect)) {
            const urlParams = new URLSearchParams(loc.substr(loc.indexOf("?") + 1)).get('code');
            try {
                console.error("close window!")
                mainWindow.close();
            } catch {
                console.error("Failed to close window!")
            }
            MSMC.MSCallBack(urlParams, token, callback, updates);
        }
    })
}