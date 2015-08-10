var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var Link = Router.Link;

var Header = React.createClass({
    render: function() {
        return (
            <nav className="navbar navbar-inverse navbar-fixed-top">
                <div className="container">
                    <div className="navbar-header">
                        <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-collapse">
                            <span className="sr-only"></span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                        </button>
                        <a className="navbar-brand" href="#">WebAppEngine</a>
                    </div>
                    <div className="navbar-collapse collapse" id="navbar-collapse">
                        <ul className="nav navbar-nav">
                            <li><Link to="dashboard">Dashboard</Link></li>
                        </ul>
                    </div>
                </div>
            </nav>
        );
    }
});

module.exports = {
    Header: Header
};
