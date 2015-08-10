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
                            <li className="dropdown">
                                <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button">Settings <span className="caret"></span></a>
                                <ul className="dropdown-menu" role="menu">
                                    <li><a  href="#">Help</a></li>
                                    <li role="separator" className="divider"></li>
                                    <li className="dropdown-header">Language</li>
                                    <li><a href="?lang=de">Deutsch</a></li>
                                    <li><a href="?lang=en">English (US)</a></li>
                                    <li><a href="?lang=es">Español</a></li>
                                    <li><a href="?lang=fr">Français</a></li>
                                    <li><a href="?lang=it">Italiano</a></li>
                                    <li><a href="?lang=ja">日本語</a></li>
                                    <li><a href="?lang=zh-cn">中文 (简体)</a></li>
                                    <li><a href="?lang=zh-tw">中文 (繁體)</a></li>
                                </ul>
                            </li>
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
