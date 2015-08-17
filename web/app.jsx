import log from './lib/log';
import React from 'react';
import Router from 'react-router';
import { Route, DefaultRoute, Link, RouteHandler } from 'react-router';
import { Header } from './components/header';
import { Home } from './components/home';
import { Dashboard } from './components/dashboard';

export class App extends React.Component {
    render() {
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
}

export function run() {
    var routes = (
        <Route name="app" path="/" handler={App}>
            <DefaultRoute handler={Home}/>
            <Route name="dashboard" handler={Dashboard}/>
        </Route>
    );
    Router.run(routes, function(Handler) {
        React.render(<Handler/>, document.querySelector('#components'));
    });
}
