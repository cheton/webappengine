var React = require('react');
var i18n = require('i18next');

var Dashboard = React.createClass({
    render: function() {
        return (
            <div className="container">
                <h1>{i18n._('Dashboard')}</h1>
            </div>
        );
    }
});

module.exports = {
    Dashboard: Dashboard
};
