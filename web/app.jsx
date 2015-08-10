var log = require('./lib/log');
var React = require('react');
var Router = require('react-router');
var Route = Router.Route,
    DefaultRoute = Router.DefaultRoute,
    Link = Router.Link,
    RouteHandler = Router.RouteHandler;

var Header = require('./components/header').Header;
var Home = require('./components/home').Home;
var Dashboard = require('./components/dashboard').Dashboard;

var App = React.createClass({
    render: function () {
        var style = {
            paddingTop: '50px',
            paddingBottom: '20px'
        };
        return (
            <div style={style}>
                <Header/>
                <RouteHandler/>
            </div>
        );
    }
});

var routes = (
    <Route name="app" path="/" handler={App}>
        <DefaultRoute handler={Home}/>
        <Route name="dashboard" handler={Dashboard}/>
    </Route>
);

Router.run(routes, function(Handler) {
    React.render(<Handler/>, document.querySelector('#components'));
});
