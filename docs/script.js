$(document).ready(function() {
    var isScreenReader = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        || navigator.userAgent.indexOf('JAWS') !== -1
        || navigator.userAgent.indexOf('NVDA') !== -1
        || navigator.userAgent.indexOf('VoiceOver') !== -1;

    if (isScreenReader) {
        $(".lyrics-line").addClass("visible");
        $(".mute-btn").addClass("visible");
    } else {
        $(".rick-bg").addClass("visible");

        var lines = $(".lyrics-line");
        var delay = 200;

        lines.each(function(i) {
            setTimeout(function() {
                lines.eq(i).addClass("visible");
            }, i * delay);
        });

        setTimeout(function() {
            $(".mute-btn").addClass("visible");
        }, lines.length * delay);
    }

    $(".mute-btn").on("click", function() {
        if (typeof goatcounter !== "undefined" && goatcounter.count) {
            goatcounter.count({
                path: "mute-btn-click",
                title: "Mute button click",
                event: true
            });
        }
    });
})
