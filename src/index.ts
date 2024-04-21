import App from './app'
import AccountRoute from './routes/account/account.route'
import { AuthenticateRoute } from './routes/authenticate/authenticate.route'
import HealthCheckRoute from './routes/health.check.route'

const app = new App([new HealthCheckRoute(), new AccountRoute(), new AuthenticateRoute()])
app.listen()
