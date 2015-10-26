var React = require('react');
var DefaultLayout = require('./layouts/default');

var HelloMessage = React.createClass({
  render: function() {
    return (
      <DefaultLayout title={this.props.title}>
        <div>there is some {this.props.error}</div>
      </DefaultLayout>
    );
  }
});

module.exports = HelloMessage;