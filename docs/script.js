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
        var delay = 200;

        lines.each(function(i) {
            setTimeout(function() {
                lines.eq(i).addClass("visible");
            }, i * delay);
        });


    }
})
