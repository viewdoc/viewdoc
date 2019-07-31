import { App } from './app'
const app = new App().app
const port = process.env.PORT || 4200
app.listen(port, () => console.log(`Exporter started http://localhost:${port}`))
