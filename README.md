inkscape_reanimator
===================

This is a node_webkit standalone application, built to help me preview animations I'm creating in Inkscape.
Currently a work in progress, so it's buggy and low on features.

Preview (perhaps one day edit) animations created in Inkscape as 1-frame-per-layer. 
Loads the Inkscape SVG file and animates by changing layer visibility.
Watches for changes to the file loaded so that your changes made in Inkscape are instantly animated.


## INSTALL

Currently using Makefile borrowed from https://github.com/HuayraLinux/huayra-stopmotion,
this need to be rewritten for this project!!

Requires: npm

~~~bash
make init
make build
~~~

## Roadmap

0. Fix bugs
0. Prettify interface
0. ~~Allow for choosing constant background layer(s)~~ *partly implemented already*
0. Possibly integrate with inkscape_onionskin plugins (custom tags in SVG to provide info to reanimator)
0. Allow per-frame durations
0. Allow frame duplication/editing
0. Allow export to GIF (via ImageMagick probably)
