
module.exports = {
    //...
    module: {
        rules: [
            {
                exclude: [
                    "modules/gui/electron.js",
                    "modules/gui/nwjs.js",
                    "modules/gui/raw.js"
                ]
            }
        ]
    },
};