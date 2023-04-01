const { app, BrowserWindow } = require("electron")
// const { Catan } = require("./games/catan/main")

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1200,
        height: 900
    })

    win.loadFile("index.html")
}

app.whenReady().then(() => {
    createWindow()
    // console.log(new Catan())
})
