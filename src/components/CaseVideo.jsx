import { useState } from 'react';

const WATCH = {
    youtube: (id) => `https://www.youtube.com/watch?v=${id}`,
    vimeo: (id) => `https://vimeo.com/${id}`,
    file: (id) => id,
};

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
                        I’m uploading these soon
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
