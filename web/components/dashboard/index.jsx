import i18n from 'i18next';
import React from 'react';
import { Widget } from '../widget';

class Widget1 extends Widget {
    render() {
        var options = {
            title: 'WIDGET 1',
            content: (
                <div>
                    <p>Widget Content</p>
                </div>
            )
        };
        return (
            <Widget options={options}/>
        );
    }
}

class Widget2 extends Widget {
    render() {
        var options = {
            title: 'WIDGET 2',
            content: (
                <div>
                    <p>Widget Content</p>
                </div>
            )
        };
        return (
            <Widget options={options}/>
        );
    }
}

class Widget3 extends Widget {
    render() {
        var options = {
            noheader: true,
            content: (
                <div>
                    <h3 className="widget-title">WIDGET WITHOUT HEADER</h3>
                    <p>Widget Content</p>
                </div>
            )
        };
        return (
            <Widget options={options}/>
        );
    }
}

class Dashboard extends React.Component {
    render() {
        return (
            <div className="container no-heading">
                <div className="row">
                    <div className="col-sm-6">
                        <Widget1/>
                    </div>
                    <div className="col-sm-6">
                        <Widget2/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <Widget3/>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = {
    Dashboard: Dashboard
};
