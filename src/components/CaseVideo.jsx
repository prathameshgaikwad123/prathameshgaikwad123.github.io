import { useState } from 'react';

/* A video in a case study. The videos themselves are not in the
   repository, and should not be: an MP4 is tens of megabytes, every clone
   of the repository would carry it for ever, and a file served from GitHub
   Pages does not adapt to the reader's connection. They live on a video
   host and are named here by the id they were given there.

   `provider`  'youtube' | 'vimeo' | 'file'. A file is a direct MP4 URL —
               a Cloudinary video upload, say — and is played by the
               browser's own <video>.
   `id`        The YouTube or Vimeo id, or for a file its full URL. Left
               null, the slot is a labelled placeholder and nothing is
               fetched from anywhere.
   `poster`    Optional. A still, as a URL. YouTube has one for every video,
               so a YouTube entry works without it; the other two want one.

   It is a facade. Until the reader presses play the page holds a picture
   and a link, so a case study with three videos does not make three
   requests to a video host, set that host's cookies or run its player
   before anyone has asked. The link is also the no-JavaScript answer:
   pressed with the script not running, it opens the video where it lives. */

const WATCH = {
    youtube: (id) => `https://www.youtube.com/watch?v=${id}`,
    vimeo: (id) => `https://vimeo.com/${id}`,
    file: (id) => id,
};

/* The no-cookie hosts, and autoplay because the press that opened the
   player is the reader's request for it to play. */
const EMBED = {
    youtube: (id) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`,
    vimeo: (id) => `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1`,
};

const POSTER = {
    youtube: (id) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
};

const Play = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
    </svg>
);

export default function CaseVideo({ video, no }) {
    const [playing, setPlaying] = useState(false);
    const { provider = 'youtube', id, poster, title, note } = video;

    const caption = (
        <figcaption>
            <span className="case-video__title">{title}</span>
            {note ? <span className="case-video__note">{note}</span> : null}
        </figcaption>
    );

    if (!id) {
        return (
            <figure className="frame case-video">
                <span className="frame__media case-video__media case-video__media--empty">
                    <span className="tbd" data-todo={`ai-video-${no}`}>
                        Video to be added — see CONTENT-TODO.md
                    </span>
                </span>
                {caption}
            </figure>
        );
    }

    const still = poster || (POSTER[provider] ? POSTER[provider](id) : undefined);

    return (
        <figure className="frame case-video">
            <span className="frame__media case-video__media">
                {playing ? (
                    provider === 'file' ? (
                        <video src={id} poster={still} controls autoPlay playsInline preload="metadata" />
                    ) : (
                        <iframe
                            src={EMBED[provider](id)}
                            title={title}
                            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                            allowFullScreen
                            referrerPolicy="strict-origin-when-cross-origin"
                        />
                    )
                ) : (
                    <a
                        className="case-video__play"
                        href={WATCH[provider](id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Play video: ${title}`}
                        onClick={(event) => {
                            /* A modified click is a request for a new tab. */
                            if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
                            event.preventDefault();
                            setPlaying(true);
                        }}
                    >
                        {still ? (
                            <img src={still} alt="" width="1600" height="900" loading="lazy" decoding="async" />
                        ) : null}
                        <span className="case-video__button">
                            <Play />
                        </span>
                    </a>
                )}
            </span>
            {caption}
        </figure>
    );
}
