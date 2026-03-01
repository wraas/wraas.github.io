$(document).ready(function() {
    var isScreenReader = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        || navigator.userAgent.indexOf('JAWS') !== -1
        || navigator.userAgent.indexOf('NVDA') !== -1
        || navigator.userAgent.indexOf('VoiceOver') !== -1;

    if (isScreenReader) {
        $(".lyrics-line").addClass("visible");
    } else {
        var lines = $(".lyrics-line");
        var delay = 600;

        lines.each(function(i) {
            setTimeout(function() {
                lines.eq(i).addClass("visible");
            }, i * delay);
        });

        setTimeout(function() {
            window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        }, lines.length * delay + 1000);
    }
})
