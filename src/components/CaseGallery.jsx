import { Zoomable } from './Lightbox.jsx';

/* The three placeholder plates every case study carries, and the note above
   them explaining what belongs there. */
export default function CaseGallery({ project, note, onZoom }) {
    return (
        <>
            <p className="case-block__note">{note}</p>
            <div className="case-gallery">
                {/* REPLACE: 1400×1050 placeholders. Their paths and alt text are
                    in src/data/projects.js. */}
                {project.gallery.map(([src, alt]) => (
                    <figure className="frame" key={src}>
                        <span className="frame__media">
                            <Zoomable
                                src={src}
                                alt={alt}
                                width="1400"
                                height="1050"
                                loading="lazy"
                                onZoom={onZoom}
                            />
                        </span>
                    </figure>
                ))}
            </div>
        </>
    );
}
