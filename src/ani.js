            var svg                 = null,
                frames              = null;
            var bgLayers            = [];
            var curFrame, prevFrame = false;
            var paused              = false;
            var FPS                 = 12;
            var tick                = new Date();
            var fileName            = null;

            function drawTimeline() {
                $('#frames').empty();
                var html = '', frameNo;
                for (var i = 0; i < frames.length; i++) {
                    frameNo = (i+1);
                    html += sprintf('<li class="frame"><a href="#%d">%d</a></li>', frameNo, frameNo);
                }
                $('#frames').html(html);//.find('.frame').css('width', (100/frames.length)+'%');
            }

            function frameFromThumb() {
                var $thumb = $('#indicator .thumb');
                var $frames = $('#frames .frame');
                $frames = $.grep($frames, function(x) { return  $thumb.offset().left >=  $(x).offset().left; });
                if (!$frames.length) return false;
                var match = $frames.slice(-1);
                if (match) return $(match).index();
                return false;
            }
            function thumbToFrame(x) {
                var $frameElt = $(sprintf('#frames .frame:eq(%d) a', x));
                if ($frameElt && $frameElt.length) {
                    $thumb = $('#indicator .thumb');
                    var tw = 12, fw = $frameElt.width();
                    var pw = $('#frames').offset().left;
                    $thumb.css('left', $frameElt.offset().left - pw + fw/2 - tw)
                }
            }
            function setFrame(x) {
                if (x === false) {
                    return;
                }
                if (prevFrame !== false) {
                    $(frames[prevFrame]).css('display', 'none');
                }
                curFrame = x;
                $(frames[curFrame]).css('display', 'inline');
                thumbToFrame(x);

                prevFrame = curFrame;
            }

            function animate() {
                var tock = new Date();
                var delay = 1000.0 / FPS;
                if (tock - tick >= delay) {
                    if (!paused) {
                        setFrame(curFrame);
                        if (++curFrame >= frames.length) {
                            curFrame = 0;
                        }
                    }
                    tick = tock;
                }
                webkitRequestAnimationFrame(animate, $('#stage')[0]);
            }

            function loaded(file) {
            	if (file) {
            		var g = require('nw.gui');
            		g.Window.get().title = file.name;
            	}
                svg = $('#stage').children()[0];
                // if (!svg.length) {
                    // setTimeout(function() { loaded(); }, 500);
                // }
                var box = sprintf("0 0 %d %d", svg.getAttribute('width'), svg.getAttribute('height'));
                svg.setAttribute('viewBox', box);
                svg.setAttribute('width', '100%');
                svg.setAttribute('height', '100%');
                frames = $.grep($(svg).find('>g'), function(x) {
                    var isLayer = x.getAttribute('inkscape:groupmode') === 'layer'
                    var isHidden = typeof x.style !== 'undefined' && typeof x.style.display !== 'undefined' && x.style.display === 'none';
                    if (isHidden) {
                        // console.log(x, 'is hidden', x.getAttribute('inkscape:label'), x.style.display);
                    }
                    if (x.getAttribute('nzgs:invisible')) {
                        isHidden = true;
                    }
                    if (x.getAttribute('nzgs:background')) {
                        bgLayers.push(x);
                        isHidden = true;
                    }
                    return isLayer && !isHidden;
                })
                $.each(frames, function() {
                    $(this).css({
                        display: 'none',
                        opacity: 1
                    });
                })
                $.each(bgLayers, function() {
                    $(this).css({display: 'inline', opacity: 1, zIndex: -1});
                });
                frames.reverse();
                drawTimeline();
                curFrame = 0;

                $('#play').removeClass('iconicstroke-play').removeClass('disabled').addClass('iconicstroke-pause').attr('disabled',null);

                paused = false;
                webkitRequestAnimationFrame(animate, $('#stage')[0]);
            }

            function readFile(evt) {
                //Retrieve the first (and only!) File from the FileList object
                var f = evt.target.files[0];
                if (f) {
                    var r = new FileReader();
                    r.onload = function(e) {
                        if (f.type !== 'image/svg+xml') {
                            alert("Try uploading an SVG file instead of " + f.type);
                            return;
                        }
                        var contents = e.target.result;
                        $('#stage').html(contents)
                        fileName = f.name;
                        /* alert( "Got the file.\n"
                            +"name: " + f.name + "\n"
                            +"type: " + f.type + "\n"
                            +"size: " + f.size + " bytesn"
                            + "starts with: " + contents.substr(1, contents.indexOf("\n"))
                        ); */
                        loaded(f);
                    }
                    r.readAsText(f);
                } else {
                    alert("Failed to load file");
                }
            }

            function openFile(fs, fileName) {
                fs.readFile(fileName, 'utf-8', function (error, contents) {
                    //console.log("Error", error);
                    // console.log("Loaded ", contents);
                    $('#stage').html(contents);
                    loaded({name: fileName});
                });                
            }

			function loadFileFromDisk(fileName) {
                window.fileName = fileName;
				console.trace("Loading", fileName);
				var fs = require('fs');
                openFile(fs, fileName);
                fs.watchFile(fileName, function(curr, prev) {
                    console.log(curr, prev);
                    if (curr.mtime != prev.mtime) {
                        openFile(fs, fileName);
                    }
                });
			}


            $(function() {
                $('#upload').on('change', readFile);
                $('#play').on('click', function(e) {
                    e.preventDefault();
                    var $this = $(this);
                    paused = !paused;
                    if (paused) {
                        $this.removeClass('iconicstroke-pause').addClass('iconicstroke-play');
                    } else {
                        $this.removeClass('iconicstroke-play').addClass('iconicstroke-pause');
                    }
                });
                $('#indicator').on('mousedown mouseup', '.thumb', function(e) {
                    var $this = $(this);
                    var data = $this.data('drag') || {dragging: false, startPos:[], offset:{}};

                    switch (e.type) {
                        case 'mousedown':
                            data.startPos = e.clientX;
                            data.offset = $(this).offset();
                            data.dragging = true;
                            $this.addClass('drag');
                            break;
                    }
                    $this.data('drag', data);
                });
                $(document.body).on('mousemove mouseup', function(e) {
                    var $this = $('#indicator .thumb');
                    var data = $this.data('drag') || {dragging: false, startPos:[], offset:{}, tID: null};

                    switch(e.type) {
                        case 'mouseup':
                        // case 'mouseleave':
                            data.dragging = false;
                            $this.removeClass('drag');                            
                            setFrame(frameFromThumb());
                            break;
                        case 'mousemove':
                            if (!data.dragging) return;
                            var delta = e.clientX - data.startPos;
                            $this.css({
                                left: data.offset.left + delta + 'px'
                            });
                            setFrame(frameFromThumb());
                            break;
                    }
                    $this.data('drag', data);
                });
                $('#frames').on('click', '.frame a', function(e) {
                    var frame = $('#frames').find(this).attr('href').replace('#','');
                    setFrame(frame - 1);
                    e.preventDefault();
                });
                $('#fps').on('change', function() {
                    FPS = $(this).val();
                });

				var gui = require('nw.gui');
				var argv = gui.App.argv;

				console.log('arguments = ', argv);
				if (argv.length) {
					loadFileFromDisk(argv[0]);
				}
                //loadFileFromDisk('/home/lucas/gfx/cat_black_anim.svg');
            });
