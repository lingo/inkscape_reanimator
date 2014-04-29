// Load native UI library
var gui = require('nw.gui');

// Get the current window
var win = gui.Window.get();

// Create a menubar for window menu
var menubar = new gui.Menu({ type: 'menubar' });

// Create a menuitem
var fileMenu = new gui.Menu();


fileMenu.append(new gui.MenuItem({
	label: 'Open SVG...',
	click: function() {
		$('#upload').click();
	}
}));
fileMenu.append(new gui.MenuItem({
	label: 'Edit this file in Inkscape',
	click: function() {
		var sys = require('sys');
		var exec = require('child_process').exec;
		exec('inkscape ' + fileName);
	}
}));

fileMenu.append(new gui.MenuItem({
	label: 'Quit',
	click: function() {
		var gui = require('nw.gui');
		gui.App.quit();
	}
}));


// You can have submenu!
menubar.append(new gui.MenuItem({ label: 'File', submenu: fileMenu}));

//assign the menubar to window menu
win.menu = menubar;

