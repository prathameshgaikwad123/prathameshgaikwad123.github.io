import { Zoomable } from '../components/Lightbox.jsx';

/* Dino The Diamond, on the same shell as every case study. The page is the
   project in its owner's own words, the picture it started from, and a link
   to where it lives. The artwork is the cover the shell already sets at the
   top, so nothing here repeats it. */

export default function blocks(project, onZoom) {
    const [file, w, h, alt] = project.inspiration;
    /* The collection's link is the one on the record, so it is written once. */
    const opensea = project.facts.find(([, value]) => value.links)[1].links[0];

    return [
        {
            key: 'about',
            label: 'About',
            body: (
                <>
                    <p>
                        This project was born from passion, creativity, and the joy of
                        building something timeless. It’s more than an NFT project; it’s a
                        reflection of my journey, emotions, and dreams.
                    </p>
                    <p>
                        Every moment spent creating it has been deeply personal. Dino The
                        Diamond will always stay close to me — a living memory, shining
                        forever on the blockchain, reminding me that art and love can truly
                        be eternal.
                    </p>
                </>
            ),
        },
        {
            key: 'inspiration',
            label: 'The inspiration',
            body: (
                <>
                    <p>
                        The collection began with this image, which I found and kept as
                        inspiration. Based on it, we designed 10,000 NFTs with different
                        attributes.
                    </p>
                    <figure className="frame">
                        <span className="frame__media">
                            <Zoomable
                                src={`/assets/images/projects/nft-projects/${file}.webp`}
                                alt={alt}
                                width={String(w)}
                                height={String(h)}
                                loading="lazy"
                                onZoom={onZoom}
                            />
                        </span>
                    </figure>
                </>
            ),
        },
        {
            key: 'collection',
            label: 'The collection',
            body: (
                <p>
                    Dino The Diamond is on OpenSea.{' '}
                    <a href={opensea.href} target="_blank" rel="noopener noreferrer">
                        View the collection
                    </a>
                    .
                </p>
            ),
        },
    ];
}
