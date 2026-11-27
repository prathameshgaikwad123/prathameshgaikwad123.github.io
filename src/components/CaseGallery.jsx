import { Zoomable } from './Lightbox.jsx';

export default function CaseGallery({ project, note, onZoom }) {
    return (
        <>
            <p className="case-block__note">{note}</p>
            <div className="case-gallery">

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
