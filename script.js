$(document).ready(function() {
    var isScreenReader = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        || navigator.userAgent.indexOf('JAWS') !== -1
        || navigator.userAgent.indexOf('NVDA') !== -1
        || navigator.userAgent.indexOf('VoiceOver') !== -1;

    if (isScreenReader) {
        $(".bg_load").hide();
        $(".wrapper").hide();
    } else {
        $(".lyrics").hide();
        $(".bg_load").fadeOut("slow");
        $(".wrapper").fadeOut("slow");
        setTimeout(function() {
            window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        }, 1000);
    }
})
