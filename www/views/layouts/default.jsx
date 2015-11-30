var React = require('react');

var DefaultLayout = React.createClass({
  render: function() {
    return (
		<!DOCTYPE html>
		<html>
		  <head>
		    <meta charset="utf-8">
		    <title>{this.props.title}</title>
		    <!-- Not present in the tutorial. Just for basic styling. -->
		    <link rel="stylesheet" href="css/base.css" />
		    <script src="https://cdnjs.cloudflare.com/ajax/libs/react/0.14.0/react.js"></script>
		    <script src="https://cdnjs.cloudflare.com/ajax/libs/react/0.14.0/react-dom.js"></script>
		    <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.6.15/browser.js"></script>
		    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
		    <script src="https://cdnjs.cloudflare.com/ajax/libs/marked/0.3.2/marked.min.js"></script>
		  </head>
		  <body>
		    <div id="content">
		    	{this.props.children}
		    </div>
		    <script type="text/babel" src="js/example.js"></script>
		    <script type="text/babel">
		      // To get started with this tutorial running your own code, simply remove
		      // the script tag loading js/example.js and start writing code here.
		    </script>
		  </body>
		</html>
    );
  }
});

module.exports = DefaultLayout;
