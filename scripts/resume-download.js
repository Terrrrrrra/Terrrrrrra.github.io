document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('resume-download');
    const content = document.getElementById('resume-content');
    if (!btn || !content) return;

    btn.addEventListener('click', async () => {
        // clone + sanitize
        const clone = content.cloneNode(true);
        clone.querySelectorAll('video, iframe, canvas, .video-thumbs, .unity-wrapper, .unity-instructions, .game-section, .game-image, .iframe-wrap, .video-thumb, button').forEach(el => el.remove());

        // wrap cloned content inside pdf-mode container to reuse resume-specific CSS
        const pdfModeContainer = document.createElement('div');
        pdfModeContainer.classList.add('pdf-mode');
        pdfModeContainer.appendChild(clone);

        // place wrapper in normal document flow (visible), not offscreen nor fully transparent
        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.left = '0';
        wrapper.style.top = '0';
        wrapper.style.width = '100%';
        wrapper.style.zIndex = '9999';
        wrapper.style.background = '#fff';
        wrapper.appendChild(pdfModeContainer);
        document.body.appendChild(wrapper);

        // ensure fonts/images ready
        try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch (e) {}
        // small delay to settle layout
        await new Promise(res => setTimeout(res, 400));

        // remember scroll, then scroll to top to avoid large top offset on capture
        const prevScroll = window.pageYOffset || document.documentElement.scrollTop || 0;
        window.scrollTo(0, 0);
        await new Promise(res => setTimeout(res, 120)); // allow browser to update

        const opt = {
            margin: [8, 8, 8, 8],
            filename: '장기성_이력서.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                // ensure capture uses top of page
                scrollY: -window.scrollY
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'] }
        };

        try {
            await html2pdf().set(opt).from(pdfModeContainer).save();
        } catch (err) {
            console.error('PDF 생성 중 오류:', err);
            alert('이력서 다운로드에 실패했습니다.');
        } finally {
            // restore scroll and cleanup
            window.scrollTo(0, prevScroll);
            document.body.removeChild(wrapper);
        }
    });
});