var React = require('react');

var Home = React.createClass({
    render: function() {
        return (
            <div>
                <div className="jumbotron">
                    <div className="container">
                        <h1>Welcome to WebAppEngine!</h1>
                        <p>If you see this page, the WebAppEngine server is successfully installed and working. Further configuration is required.</p>
                        <p>For online documentation please refer to <a href="http://cheton.github.io/webappengine/">http://cheton.github.io/webappengine/</a>.</p>
                        <p><a className="btn btn-primary btn-lg" href="https://github.com/cheton/webappengine" role="button">Learn more »</a></p>
                        <p><i>Thank you for using WebAppEngine.</i></p>
                    </div>
                </div>
                <div className="container"></div>
            </div>
        );
    }
});

module.exports = {
    Home: Home
};
