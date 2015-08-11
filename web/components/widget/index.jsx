import i18next from 'i18next';
import React from 'react';

require('./widget.css');

class WidgetHeader extends React.Component {
    render() {
        var { options } = this.props;
        options = options || {};
        return (
            <div className="widget-header clearfix">
                <h3 className="widget-header-title"><i className="icon ion-pricetag"></i>&nbsp;<span>{options.title}</span></h3>
                <div className="btn-group widget-header-toolbar">
                    <a href="#" title="Expand/Collapse" className="btn btn-link btn-toggle-expand"><i className="icon ion-ios7-arrow-up"></i></a>
                    <a href="#" title="Remove" className="btn btn-link btn-remove"><i className="icon ion-ios7-close-empty"></i></a>
                </div>
            </div>
        );
    }
}

class WidgetContent extends React.Component {
    render() {
        var { options } = this.props;
        options = options || {};
        return (
            <div className="widget-content">{options.content}</div>
        );
    }
}

class WidgetFooter extends React.Component {
    render() {
        return (
            <div className="widget-footer"></div>
        );
    }
}

class Widget extends React.Component {
    render() {
        var { options } = this.props;
        options = options || {};
        return (
            <div className="widget">
                { ! options.noheader && 
                    <WidgetHeader options={options}/>
                }
                <WidgetContent options={options}/>
            </div>
        );
    }
}

module.exports = {
    Widget: Widget
};
