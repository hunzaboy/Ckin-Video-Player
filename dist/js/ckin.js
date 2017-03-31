/*!
   ckin v0.0.1: Custom HTML5 Video Player Skins.
   (c) 2017 
   MIT License
   git+https://github.com/hunzaboy/ckin.git
*/
// Source: https://gist.github.com/k-gun/c2ea7c49edf7b757fe9561ba37cb19ca;
(function () {
    // helpers
    var regExp = function regExp(name) {
        return new RegExp('(^| )' + name + '( |$)');
    };
    var forEach = function forEach(list, fn, scope) {
        for (var i = 0; i < list.length; i++) {
            fn.call(scope, list[i]);
        }
    };

    // class list object with basic methods
    function ClassList(element) {
        this.element = element;
    }

    ClassList.prototype = {
        add: function add() {
            forEach(arguments, function (name) {
                if (!this.contains(name)) {
                    this.element.className += ' ' + name;
                }
            }, this);
        },
        remove: function remove() {
            forEach(arguments, function (name) {
                this.element.className = this.element.className.replace(regExp(name), '');
            }, this);
        },
        toggle: function toggle(name) {
            return this.contains(name) ? (this.remove(name), false) : (this.add(name), true);
        },
        contains: function contains(name) {
            return regExp(name).test(this.element.className);
        },
        // bonus..
        replace: function replace(oldName, newName) {
            this.remove(oldName), this.add(newName);
        }
    };

    // IE8/9, Safari
    if (!('classList' in Element.prototype)) {
        Object.defineProperty(Element.prototype, 'classList', {
            get: function get() {
                return new ClassList(this);
            }
        });
    }

    // replace() support for others
    if (window.DOMTokenList && DOMTokenList.prototype.replace == null) {
        DOMTokenList.prototype.replace = ClassList.prototype.replace;
    }
})();
(function () {
    if (typeof NodeList.prototype.forEach === "function") return false;
    NodeList.prototype.forEach = Array.prototype.forEach;
})();

// Unfortunately, due to scattered support, browser sniffing is required
function browserSniff() {
    var nVer = navigator.appVersion,
        nAgt = navigator.userAgent,
        browserName = navigator.appName,
        fullVersion = '' + parseFloat(navigator.appVersion),
        majorVersion = parseInt(navigator.appVersion, 10),
        nameOffset,
        verOffset,
        ix;

    // MSIE 11
    if (navigator.appVersion.indexOf("Windows NT") !== -1 && navigator.appVersion.indexOf("rv:11") !== -1) {
        browserName = "IE";
        fullVersion = "11;";
    }
    // MSIE
    else if ((verOffset = nAgt.indexOf("MSIE")) !== -1) {
            browserName = "IE";
            fullVersion = nAgt.substring(verOffset + 5);
        }
        // Chrome
        else if ((verOffset = nAgt.indexOf("Chrome")) !== -1) {
                browserName = "Chrome";
                fullVersion = nAgt.substring(verOffset + 7);
            }
            // Safari
            else if ((verOffset = nAgt.indexOf("Safari")) !== -1) {
                    browserName = "Safari";
                    fullVersion = nAgt.substring(verOffset + 7);
                    if ((verOffset = nAgt.indexOf("Version")) !== -1) {
                        fullVersion = nAgt.substring(verOffset + 8);
                    }
                }
                // Firefox
                else if ((verOffset = nAgt.indexOf("Firefox")) !== -1) {
                        browserName = "Firefox";
                        fullVersion = nAgt.substring(verOffset + 8);
                    }
                    // In most other browsers, "name/version" is at the end of userAgent
                    else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
                            browserName = nAgt.substring(nameOffset, verOffset);
                            fullVersion = nAgt.substring(verOffset + 1);
                            if (browserName.toLowerCase() == browserName.toUpperCase()) {
                                browserName = navigator.appName;
                            }
                        }
    // Trim the fullVersion string at semicolon/space if present
    if ((ix = fullVersion.indexOf(";")) !== -1) {
        fullVersion = fullVersion.substring(0, ix);
    }
    if ((ix = fullVersion.indexOf(" ")) !== -1) {
        fullVersion = fullVersion.substring(0, ix);
    }
    // Get major version
    majorVersion = parseInt('' + fullVersion, 10);
    if (isNaN(majorVersion)) {
        fullVersion = '' + parseFloat(navigator.appVersion);
        majorVersion = parseInt(navigator.appVersion, 10);
    }
    // Return data
    return [browserName, majorVersion];
}

var obj = {};
obj.browserInfo = browserSniff();
obj.browserName = obj.browserInfo[0];
obj.browserVersion = obj.browserInfo[1];

wrapPlayers();
/* Get Our Elements */
var players = document.querySelectorAll('.ckin-player');
var iconPlay = '<i class="ckin-play"></i>';
var iconPause = '<i class="ckin-pause"></i>';
var iconMute = '<i class="ckin-mute"></i>';
var iconUnMute = '<i class="ckin-unmute"></i>';

players.forEach(function (player) {
    var html = buildControls();
    player.insertAdjacentHTML('beforeend', html);
    var video = player.querySelector('video');
    var skin = attachSkin(video.dataset.ckin);
    player.classList.add(skin);

    var playerControls = player.querySelector('.ckin-player__controls');
    var progress = player.querySelector('.progress');;
    var progressBar = player.querySelector('.progress__filled');
    var toggle = player.querySelectorAll('.toggle');
    var skipButtons = player.querySelectorAll('[data-skip]');
    var ranges = player.querySelectorAll('.ckin-player__slider');
    var volumeButton = player.querySelector('.volume');

    if (obj.browserName === "IE" && (obj.browserVersion === 8 || obj.browserVersion === 9)) {
        showControls(video);
        playerControls.style.display = "none";
    }

    video.addEventListener('click', function () {
        togglePlay(this, player);
    });
    video.addEventListener('play', function () {
        updateButton(this, toggle);
    });

    video.addEventListener('pause', function () {
        updateButton(this, toggle);
    });
    video.addEventListener('timeupdate', function () {
        handleProgress(this, progressBar);
    });

    toggle.forEach(function (button) {
        return button.addEventListener('click', function () {
            togglePlay(video, player);
        });
    });
    volumeButton.addEventListener('click', function () {
        toggleVolume(video, volumeButton);
    });

    var mousedown = false;
    progress.addEventListener('click', function (e) {
        scrub(e, video, progress);
    });
    progress.addEventListener('mousemove', function (e) {
        return mousedown && scrub(e, video, progress);
    });
    progress.addEventListener('mousedown', function () {
        return mousedown = true;
    });
    progress.addEventListener('mouseup', function () {
        return mousedown = false;
    });
});

function showControls(video) {

    video.setAttribute("controls", "controls");
}
/* Build out functions */
function togglePlay(video, player) {
    var method = video.paused ? 'play' : 'pause';
    video[method]();
    video.paused ? player.classList.remove('is-playing') : player.classList.add('is-playing');
}

function updateButton(video, toggle) {
    var icon = video.paused ? iconPlay : iconPause;
    toggle.forEach(function (button) {
        return button.innerHTML = icon;
    });
}

function skip() {
    video.currentTime += parseFloat(this.dataset.skip);
}

function toggleVolume(video, volumeButton) {
    var level = video.volume ? '0' : '1';
    var icon = video.volume ? iconMute : iconUnMute;
    video['volume'] = level;
    volumeButton.innerHTML = icon;
}

function handleRangeUpdate() {
    video[this.name] = this.value;
}

function handleProgress(video, progressBar) {
    var percent = video.currentTime / video.duration * 100;
    progressBar.style.flexBasis = percent + '%';
}

function scrub(e, video, progress) {
    var scrubTime = e.offsetX / progress.offsetWidth * video.duration;
    video.currentTime = scrubTime;
}
// Build the default HTML
function wrapPlayers() {

    var videos = document.querySelectorAll('video');

    videos.forEach(function (video) {

        // create wrapper container
        var wrapper = document.createElement('div');
        wrapper.classList.add('ckin-player');

        // insert wrapper before video in the DOM tree
        video.parentNode.insertBefore(wrapper, video);

        // move el into wrapper
        wrapper.appendChild(video);
    });
}

function buildControls() {
    // Create html array
    var html = [];
    html.push('<button class="ckin-player__button--big toggle" title="Toggle Play">' + iconPlay + '</button>');

    html.push('<div class="ckin-player__controls">');

    html.push('<button class="ckin-player__button toggle" title="Toggle Video">' + iconPlay + '</button>', '<div class="progress">', '<div class="progress__filled"></div>', '</div>', '<button class="ckin-player__button volume" title="Volume">' + iconUnMute + '</button>');

    html.push('</div>');

    return html.join('');
}

function attachSkin(skin) {
    if (typeof skin != 'undefined' && skin != '') {
        return skin;
    } else {
        return 'default';
    }
}