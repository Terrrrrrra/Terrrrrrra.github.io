document.addEventListener('DOMContentLoaded', () => {
    const s1Video = document.getElementById('main-video');
    const s3Video = document.getElementById('main-video-3');
    const youtubeIframeId = 'youtube-iframe';

    // playlists
    const s1Files = ['Video/DarkKnight.mp4','Video/Paladin.mp4','Video/Priest.mp4','Video/Sorcerer.mp4','Video/Warrior.mp4','Video/Wizard.mp4'];
    const s3Files = ['Video/11.mp4','Video/22.mp4','Video/44.mp4'];
    let s1Index = 0;
    let s3Index = 0;

    let ytPlayer = null;
    let ytReady = false;
    let autoplayRequested = false;

    // Pause helper used only when switching to YouTube (so videos remain independent)
    function pauseAllForYouTube(){
        try{ if(s1Video) s1Video.pause(); }catch(e){}
        try{ if(s3Video) s3Video.pause(); }catch(e){}
    }

    // Section1 playback: DOES NOT pause section3
    function playSection1(){
        if(!s1Video) return;
        s1Video.muted = true;
        // ensure source element updated (keeps same approach as section3)
        const srcEl = s1Video.querySelector('source');
        if(srcEl){
            srcEl.src = s1Files[s1Index];
            s1Video.load();
            s1Video.play().catch(()=>{});
        } else {
            s1Video.src = s1Files[s1Index];
            s1Video.load();
            s1Video.play().catch(()=>{});
        }
    }

    // Section2 (YouTube) will pause local videos
    function playSection2(){
        pauseAllForYouTube();
        if(ytPlayer && ytReady){
            try{ ytPlayer.mute(); ytPlayer.playVideo(); }catch(e){}
        } else {
            const ifr = document.getElementById(youtubeIframeId);
            if(ifr){
                const base = ifr.src.split('?')[0];
                ifr.src = base + '?enablejsapi=1&autoplay=1&rel=0&playsinline=1';
            }
        }
    }

    // Section3 playback: DOES NOT pause section1
    function playSection3(){
        if(!s3Video) return;
        s3Video.muted = true;
        const srcEl = s3Video.querySelector('source');
        const newSrc = s3Files[s3Index];
        if(srcEl){
            srcEl.src = newSrc;
            s3Video.load();
            s3Video.play().catch(()=>{});
        } else {
            s3Video.src = newSrc;
            s3Video.load();
            s3Video.play().catch(()=>{});
        }
    }

    // s1 auto-advance and loop
    if(s1Video){
        // ensure initial source matches s1Index
        const initSrcEl = s1Video.querySelector('source');
        if(initSrcEl) initSrcEl.src = s1Files[s1Index];
        else s1Video.src = s1Files[s1Index];

        s1Video.addEventListener('ended', () => {
            s1Index++;
            if(s1Index >= s1Files.length) s1Index = 0; // loop
            playSection1();
        });
    }

    // s3 auto-advance and loop
    if(s3Video){
        const initSrcEl3 = s3Video.querySelector('source');
        if(initSrcEl3) initSrcEl3.src = s3Files[s3Index];
        else s3Video.src = s3Files[s3Index];

        s3Video.addEventListener('ended', () => {
            s3Index++;
            if(s3Index >= s3Files.length) s3Index = 0; // loop
            playSection3();
        });
    }

    // respond to thumbnail selection to update internal indices
    document.addEventListener('thumb-selected', (e) => {
        const d = e.detail || {};
        if(d.mainId === 'main-video' && typeof d.index === 'number'){
            s1Index = d.index;
        } else if(d.mainId === 'main-video-3' && typeof d.index === 'number'){
            s3Index = d.index;
        }
    });

    // YouTube API
    window.onYouTubeIframeAPIReady = function(){
        ytPlayer = new YT.Player('youtube-iframe', {
            events: {
                onReady: function(){
                    ytReady = true;
                    if(autoplayRequested){
                        ytPlayer.mute();
                        ytPlayer.playVideo();
                    }
                },
                onStateChange: function(e){
                    if(e.data === YT.PlayerState.ENDED){
                        // when youtube ends, start s3 (non-blocking)
                        playSection3();
                    }
                }
            },
            playerVars: { controls:1, rel:0, modestbranding:1, playsinline:1 }
        });
    };
    (function loadYT(){
        if(window.YT && window.YT.Player) return;
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
    })();

    // initial autoplay both s1 and s3 (muted so browsers allow)
    autoplayRequested = true;
    setTimeout(() => {
        s1Index = 0;
        s3Index = 0;
        if (s1Video) playSection1();
        if (s3Video) playSection3();
    }, 300);

    // allow user click to unmute currently playing local videos and youtube
    document.addEventListener('click', () => {
        try{ if(s1Video && !s1Video.paused) s1Video.muted = false; }catch(e){}
        try{ if(s3Video && !s3Video.paused) s3Video.muted = false; }catch(e){}
        try{ if(ytPlayer && ytReady) ytPlayer.unMute(); }catch(e){}
    }, { once: false });
});