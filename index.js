const ftp = require('basic-ftp')
const express = require('express')
const app = express()
const port = process.env.PORT||3000

app.get('/*', async (req, res) => {
    let path = decodeURI(req.path)
    if (path.endsWith('/')) var isDir = true
    else var isDir = false
    if (!req.query.host) return res.json({msg: 'no host specified'})
    let client = new ftp.Client()
    res.set('Access-Control-Allow-Origin', '*')
    try {
        await client.access({
            host: req.query.host,
            user: req.query.user,
            password: req.query.pass,
            secure: req.query.secure||false
        })
        if (isDir) {
            await client.cd(path)
            res.json({
                currentDir: await client.pwd(),
                list: await client.list()
            })
        } else {
            await client.downloadTo(res, path)
        }
        client.close()
    } catch (error) {
        console.log(error)
        res.status(500).json({err: true, info: error, stack: error.stack})
    }
})

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})