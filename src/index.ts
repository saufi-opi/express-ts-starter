import App from './app'
import AccountRoute from './routes/account.route'
import HealthCheckRoute from './routes/health.check.route'

const app = new App([new HealthCheckRoute(), new AccountRoute()])
app.listen()
