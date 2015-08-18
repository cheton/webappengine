import i18next from 'i18next';
import React from 'react';

require('./widget.css');

class WidgetHeader extends React.Component {
    render() {
        let { options } = this.props;
        options = options || {};
        return (
            <div className="widget-header clearfix">
                <h3 className="widget-header-title"><i className="icon ion-pricetag"></i>&nbsp;<span>{options.title}</span></h3>
                <div className="btn-group widget-header-toolbar">
                    <a href="javascript: void(0)" title="Expand/Collapse" className="btn btn-link btn-toggle-expand" onClick={this.props.handleClick.bind(this, 'btn-toggle-expand')}><i className="icon ion-ios-arrow-up"></i></a>
                    <a href="javascript: void(0)" title="Remove" className="btn btn-link btn-remove" onClick={this.props.handleClick.bind(this, 'btn-remove')}><i className="icon ion-ios-close-empty"></i></a>
                </div>
            </div>
        );
    }
}

class WidgetContent extends React.Component {
    render() {
        let { options } = this.props;
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

export class Widget extends React.Component {
    handleClick(target) {
        if (target === 'btn-remove') {
            this.unmount();
        }
    }
    unmount() {
        let container = React.findDOMNode(this.refs.widgetContainer);
        React.unmountComponentAtNode(container);
        container.remove();
    }
    render() {
        let { options } = this.props;
        options = options || {};
        options.containerClass = (options.containerClass || '');
        return (
            <div className={options.containerClass} ref="widgetContainer">
                <div className="widget">
                    { ! options.noheader && 
                        <WidgetHeader options={options} handleClick={this.handleClick.bind(this)}/>
                    }
                    <WidgetContent options={options}/>
                </div>
            </div>
        );
    }
}
