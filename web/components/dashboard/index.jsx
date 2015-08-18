import i18n from 'i18next';
import React from 'react';
import Sortable from 'Sortable';
import { Widget } from '../widget';

class Widget1 extends React.Component {
    render() {
        var options = {
            containerClass: 'col-sm-6',
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

class Widget2 extends React.Component {
    render() {
        var options = {
            containerClass: 'col-sm-6',
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

class Widget3 extends React.Component {
    render() {
        var options = {
            containerClass: 'col-sm-12',
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

class Widget4 extends React.Component {
    render() {
        var options = {
            containerClass: 'col-sm-4',
            title: this.props.title,
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

class WidgetList extends React.Component {
    constructor(props) {
        super(props);
        this._sortableInstance = null;
    }
    componentDidMount() {
        var dom = React.findDOMNode(this);
        this._sortableInstance = Sortable.create(dom, {
            filter: '.widget-content'
        });
    }
    componentWillUnmount() {
        this._sortableInstance.destroy();
        this._sortableInstance = null;
    }
    render() {
        return (
            <div className="row">
                <Widget1/>
                <Widget2/>
                <Widget3/>
                <Widget4 title="widget 5"/>
                <Widget4 title="widget 6"/>
                <Widget4 title="widget 7"/>
            </div>
        );
    }
}

export class Dashboard extends React.Component {
    render() {
        return (
            <div className="container no-heading">
                <WidgetList/>
            </div>
        );
    }
}
