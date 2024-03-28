import App from "./app"
import HealthCheckRoute from "./routes/health.check.route"

const app = new App([new HealthCheckRoute()])
app.listen()
