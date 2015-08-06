var log = require('./lib/log');
var React = require('react');
var Router = require('react-router');
var Route = Router.Route,
    DefaultRoute = Router.DefaultRoute,
    Link = Router.Link,
    RouteHandler = Router.RouteHandler;

var Header = require('./components/header').Header;

var App = React.createClass({
    render: function () {
        var divStyle = {
            marginTop: '70px'
        };
        return (
            <div style={divStyle}>
                <Header/>
                <RouteHandler/>
            </div>
        );
    }
});

var Home = React.createClass({
    render: function() {
        return <h1>Home</h1>;
    }
});

var Dashboard = React.createClass({
    render: function() {
        return <h1>Dashboard</h1>;
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
