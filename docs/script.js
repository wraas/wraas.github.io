$(document).ready(function() {
    var isScreenReader = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        || navigator.userAgent.indexOf('JAWS') !== -1
        || navigator.userAgent.indexOf('NVDA') !== -1
        || navigator.userAgent.indexOf('VoiceOver') !== -1;

    if (isScreenReader) {
        $(".lyrics-line").addClass("visible");
    } else {
        $(".rick-bg").addClass("visible");

        var lines = $(".lyrics-line");
        var delay = 600;

        lines.each(function(i) {
            setTimeout(function() {
                lines.eq(i).addClass("visible");
            }, i * delay);
        });

        setTimeout(function() {
            window.location.href = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&start=43';
        }, lines.length * delay + 1000);
    }
})
