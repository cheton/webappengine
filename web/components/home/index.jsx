import React from 'react';
import i18n from 'i18next';

export class Home extends React.Component {
    render() {
        return (
            <div>
                <div className="jumbotron">
                    <div className="container">
                        <h1>{i18n._('Welcome to WebAppEngine!')}</h1>
                        <p>{i18n._('If you see this page, the WebAppEngine server is successfully installed and working. Further configuration is required.')}</p>
                        <p dangerouslySetInnerHTML={
                            {__html: i18n._('For online documentation please refer to <a href="http://cheton.github.io/webappengine/">http://cheton.github.io/webappengine/</a>.')}
                        } />
                        <p><a className="btn btn-primary btn-lg" href="https://github.com/cheton/webappengine" role="button">{i18n._('Learn more »')}</a></p>
                        <p><i>{i18n._('Thank you for using WebAppEngine.')}</i></p>
                    </div>
                </div>
                <div className="container"></div>
            </div>
        );
    }
}
