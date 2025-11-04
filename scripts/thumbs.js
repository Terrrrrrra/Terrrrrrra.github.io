(function(){
    const base = "Video/";
    function createThumb(src, file, mainVideo, index){
        const thumb = document.createElement("video");
        thumb.className = "video-thumb";
        thumb.src = src;
        thumb.muted = true;
        thumb.preload = "metadata";
        thumb.setAttribute("aria-label", file);
        thumb.dataset.index = index;
        thumb.addEventListener("click", () => {
            // update main video source (use source element if present)
            const mainSource = mainVideo.querySelector("source");
            if (mainSource) {
                mainSource.src = src;
                mainVideo.load();
                mainVideo.play().catch(()=>{});
            } else {
                mainVideo.src = src;
                mainVideo.load();
                mainVideo.play().catch(()=>{});
            }
            // notify media controller which index was selected
            document.dispatchEvent(new CustomEvent('thumb-selected', {
                detail: {
                    mainId: mainVideo.id,
                    index: index,
                    src: src
                }
            }));
        });
        thumb.addEventListener("mouseenter", () => thumb.play().catch(()=>{}));
        thumb.addEventListener("mouseleave", () => { thumb.pause(); thumb.currentTime = 0; });
        return thumb;
    }

    function populate(selector, files, mainId){
        const wrap = document.querySelector(selector);
        const mainVideo = document.getElementById(mainId);
        if(!wrap || !mainVideo) return;
        files.forEach((file, i) => {
            const src = base + file;
            wrap.appendChild(createThumb(src, file, mainVideo, i));
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        populate("#game-image-1 .video-thumbs",
            ["DarkKnight.mp4","Paladin.mp4","Priest.mp4","Sorcerer.mp4","Warrior.mp4","Wizard.mp4"],
            "main-video");

        populate("#thumbs-3",
            ["11.mp4","22.mp4","44.mp4"],
            "main-video-3");
    });
})();